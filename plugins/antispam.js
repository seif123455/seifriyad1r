import fs from 'fs';
import path from 'path';
import { dataFile } from '../lib/paths.js';
import store from '../lib/lightweight_store.js';
import { channelInfo } from '../lib/messageConfig.js';

const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);
const configPath = dataFile('antispam.json');

// ── متتبع الرسائل المكررة ────────────────────────────────────────────────
const tracker = new Map();
const metaCache = new Map();
const META_TTL_MS = 5 * 60 * 1000; // 5 دقائق

async function getParticipants(sock, chatId) {
    const cached = metaCache.get(chatId);
    if (cached && (Date.now() - cached.fetchedAt) < META_TTL_MS) {
        return cached.participants;
    }
    try {
        const metadata = await sock.groupMetadata(chatId);
        const participants = metadata?.participants || [];
        metaCache.set(chatId, { participants, fetchedAt: Date.now() });
        return participants;
    } catch (_e) {
        return cached?.participants || [];
    }
}

function isParticipantAdmin(participants, jid) {
    if (!jid) return false;
    const num = jid.split('@')[0].split(':')[0];
    return participants.some((p) => {
        if (p.admin !== 'admin' && p.admin !== 'superadmin') return false;
        const pId = (p.id || '');
        const pLid = (p.lid || '');
        const pNum = pId.split('@')[0].split(':')[0];
        const pLidNum = pLid.split('@')[0].split(':')[0];
        const pPhone = p.phoneNumber ? p.phoneNumber.split('@')[0] : '';
        return (pId === jid || pLid === jid || pNum === num || pLidNum === num || pPhone === num);
    });
}

function getBotAdminStatus(participants, sock) {
    const botId = sock.user?.id || '';
    const botLid = sock.user?.lid || '';
    const botNum = botId.split('@')[0].split(':')[0];
    const botLidNum = botLid.split('@')[0].split(':')[0];
    return participants.some((p) => {
        if (p.admin !== 'admin' && p.admin !== 'superadmin') return false;
        const pId = (p.id || '');
        const pLid = (p.lid || '');
        const pNum = pId.split('@')[0].split(':')[0];
        const pLidNum = pLid.split('@')[0].split(':')[0];
        const pPhone = p.phoneNumber ? p.phoneNumber.split('@')[0] : '';
        return (pId === botId || pId === botLid || pLid === botLid || pLid === botId ||
            pNum === botNum || pLidNum === botLidNum || pNum === botLidNum ||
            pLidNum === botNum || pPhone === botNum);
    });
}

const DEFAULT_GROUP_CONFIG = {
    enabled: false,
    maxMessages: 5,
    windowSeconds: 5,
    action: 'warn',
    warnCount: 3
};

async function loadConfig() {
    try {
        if (HAS_DB) {
            const data = await store.getSetting('global', 'antispam');
            return data || { groups: {} };
        } else {
            if (!fs.existsSync(configPath)) {
                const dataDir = path.dirname(configPath);
                if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
                fs.writeFileSync(configPath, JSON.stringify({ groups: {} }, null, 2));
            }
            return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        }
    } catch {
        return { groups: {} };
    }
}

async function saveConfig(config) {
    if (HAS_DB) {
        await store.saveSetting('global', 'antispam', config);
    } else {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    }
}

// ── دالة منع التكرار الرئيسية ────────────────────────────────────────────
export async function handleAntiSpam(sock, chatId, message, senderId, senderIsOwnerOrSudo) {
    try {
        if (message.key.fromMe || senderIsOwnerOrSudo) return false;
        
        const config = await loadConfig();
        const groupConfig = config.groups[chatId];
        if (!groupConfig || !groupConfig.enabled) return false;
        
        const participants = await getParticipants(sock, chatId);
        const isBotAdmin = getBotAdminStatus(participants, sock);
        const isSenderAdmin = isParticipantAdmin(participants, senderId);
        
        if (isSenderAdmin) return false;
        
        const now = Date.now();
        const windowMs = groupConfig.windowSeconds * 1000;
        
        if (!tracker.has(chatId)) tracker.set(chatId, new Map());
        const groupTracker = tracker.get(chatId);
        
        if (!groupTracker.has(senderId)) {
            groupTracker.set(senderId, { count: 1, firstMessageTime: now, warns: 0 });
            return false;
        }
        
        const userData = groupTracker.get(senderId);
        
        if (now - userData.firstMessageTime > windowMs) {
            userData.count = 1;
            userData.firstMessageTime = now;
            return false;
        }
        
        userData.count++;
        if (userData.count <= groupConfig.maxMessages) return false;
        
        // ── تم اكتشاف تكرار ──────────────────────────────────────────────────
        userData.count = 0;
        userData.firstMessageTime = now;
        
        if (groupConfig.action === 'warn') {
            userData.warns++;
            const warnsLeft = groupConfig.warnCount - userData.warns;
            try {
                if (warnsLeft > 0) {
                    await sock.sendMessage(chatId, {
                        text: `⚠️ @${senderId.split('@')[0]} *ممنوع التكرار!*\n_تحذير ${userData.warns}/${groupConfig.warnCount}. باقي ${warnsLeft} تحذير قبل الطرد._`,
                        mentions: [senderId],
                        ...channelInfo
                    });
                } else {
                    userData.warns = 0;
                    if (!isBotAdmin) {
                        await sock.sendMessage(chatId, {
                            text: `⚠️ @${senderId.split('@')[0]} وصل للحد الأقصى من التحذيرات لكن البوت ليس أدمن.`,
                            mentions: [senderId],
                            ...channelInfo
                        });
                    } else {
                        await sock.sendMessage(chatId, {
                            text: `🚫 @${senderId.split('@')[0]} تم *طرده* بسبب التكرار المستمر.`,
                            mentions: [senderId],
                            ...channelInfo
                        });
                        await new Promise(r => setTimeout(r, 500));
                        await sock.groupParticipantsUpdate(chatId, [senderId], 'remove');
                    }
                }
            } catch (sendErr) {
                console.error('[ANTISPAM] فشل إرسال التحذير:', sendErr.message);
            }
            return true;
        }
        
        if (groupConfig.action === 'kick') {
            if (!isBotAdmin) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ تكرار من @${senderId.split('@')[0]} — البوت يحتاج صلاحيات أدمن للطرد.`,
                    mentions: [senderId],
                    ...channelInfo
                });
            } else {
                await sock.sendMessage(chatId, {
                    text: `🚫 @${senderId.split('@')[0]} تم طرده بسبب التكرار.`,
                    mentions: [senderId],
                    ...channelInfo
                });
                await sock.groupParticipantsUpdate(chatId, [senderId], 'remove');
            }
            return true;
        }
        
        if (groupConfig.action === 'mute') {
            if (!isBotAdmin) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ تكرار من @${senderId.split('@')[0]} — البوت يحتاج صلاحيات أدمن للكتم.`,
                    mentions: [senderId],
                    ...channelInfo
                });
            } else {
                await sock.sendMessage(chatId, {
                    text: `🔇 @${senderId.split('@')[0]} تم كتمه بسبب التكرار.`,
                    mentions: [senderId],
                    ...channelInfo
                });
                await sock.groupParticipantsUpdate(chatId, [senderId], 'remove');
            }
            return true;
        }
        
        return false;
    } catch (e) {
        console.error('[ANTISPAM] خطأ:', e.message);
        return false;
    }
}

// تحديث الكاش عند تغيير المشاركين
export function invalidateGroupCache(chatId) {
    metaCache.delete(chatId);
    tracker.delete(chatId);
}

export { loadConfig, saveConfig, DEFAULT_GROUP_CONFIG };

export default {
    command: 'تكرار',
    aliases: ['antispam', 'floodprotect', 'antiflood', 'منع_التكرار'],
    category: 'admin',
    description: 'إعداد حماية منع التكرار في المجموعة',
    usage: '!تكرار on/off | !تكرار set <عدد> <ثواني> | !تكرار action <warn/kick/mute> | !تكرار warns <عدد>',
    groupOnly: true,
    adminOnly: true,
    
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};
        const isBotAdmin = context.isBotAdmin || false;
        
        const config = await loadConfig();
        if (!config.groups[chatId]) config.groups[chatId] = { ...DEFAULT_GROUP_CONFIG };
        const groupConfig = config.groups[chatId];
        const action = args[0]?.toLowerCase();
        
        if (!action || action === 'status') {
            return await sock.sendMessage(chatId, {
                text: `*🛡️ حالة منع التكرار*\n\n` +
                    `*الحالة:* ${groupConfig.enabled ? '✅ مفعل' : '❌ معطل'}\n` +
                    `*الحد:* ${groupConfig.maxMessages} رسالة في ${groupConfig.windowSeconds} ثانية\n` +
                    `*الإجراء:* ${groupConfig.action.toUpperCase()}\n` +
                    `*حد التحذيرات:* ${groupConfig.warnCount} تحذير قبل الطرد\n` +
                    `*البوت أدمن:* ${isBotAdmin ? '✅ نعم' : '❌ لا'}\n\n` +
                    `*الأوامر:*\n` +
                    `• \`!تكرار on/off\`\n` +
                    `• \`!تكرار set 5 10\` — 5 رسائل في 10 ثواني\n` +
                    `• \`!تكرار action warn/kick/mute\`\n` +
                    `• \`!تكرار warns 3\` — تحذيرات قبل الطرد`,
                ...channelInfo
            }, { quoted: message });
        }
        
        if (action === 'on' || action === 'enable') {
            if (groupConfig.enabled)
                return await sock.sendMessage(chatId, { text: '⚠️ منع التكرار مفعل بالفعل.', ...channelInfo }, { quoted: message });
            
            if (!isBotAdmin && groupConfig.action !== 'warn') {
                await sock.sendMessage(chatId, { text: `⚠️ البوت ليس أدمن — لن يعمل الطرد/الكتم حتى يصبح البوت أدمن.`, ...channelInfo }, { quoted: message });
            }
            
            groupConfig.enabled = true;
            await saveConfig(config);
            return await sock.sendMessage(chatId, {
                text: `✅ *تم تفعيل منع التكرار!*\nالحد: ${groupConfig.maxMessages} رسالة في ${groupConfig.windowSeconds} ثانية | الإجراء: ${groupConfig.action.toUpperCase()}`,
                ...channelInfo
            }, { quoted: message });
        }
        
        if (action === 'off' || action === 'disable') {
            if (!groupConfig.enabled)
                return await sock.sendMessage(chatId, { text: '⚠️ منع التكرار معطل بالفعل.', ...channelInfo }, { quoted: message });
            
            groupConfig.enabled = false;
            await saveConfig(config);
            return await sock.sendMessage(chatId, { text: '❌ *تم تعطيل منع التكرار.*', ...channelInfo }, { quoted: message });
        }
        
        if (action === 'set') {
            const maxMsgs = parseInt(args[1], 10);
            const windowSec = parseInt(args[2], 10);
            if (isNaN(maxMsgs) || isNaN(windowSec) || maxMsgs < 2 || windowSec < 1) {
                return await sock.sendMessage(chatId, { text: '❌ الاستخدام: `!تكرار set <رسائل> <ثواني>`\nمثال: `!تكرار set 5 10`', ...channelInfo }, { quoted: message });
            }
            groupConfig.maxMessages = maxMsgs;
            groupConfig.windowSeconds = windowSec;
            await saveConfig(config);
            return await sock.sendMessage(chatId, { text: `✅ تم ضبط الحد: *${maxMsgs} رسالة* في *${windowSec} ثانية*`, ...channelInfo }, { quoted: message });
        }
        
        if (action === 'action') {
            const newAction = args[1]?.toLowerCase();
            if (!['warn', 'kick', 'mute'].includes(newAction)) {
                return await sock.sendMessage(chatId, { text: '❌ اختر: `warn`, `kick`, أو `mute`', ...channelInfo }, { quoted: message });
            }
            if (newAction !== 'warn' && !isBotAdmin) {
                await sock.sendMessage(chatId, { text: `⚠️ تم ضبط الإجراء على *${newAction.toUpperCase()}* لكن البوت يحتاج صلاحيات أدمن.`, ...channelInfo }, { quoted: message });
            }
            groupConfig.action = newAction;
            await saveConfig(config);
            return await sock.sendMessage(chatId, { text: `✅ الإجراء: *${newAction.toUpperCase()}*`, ...channelInfo }, { quoted: message });
        }
        
        if (action === 'warns') {
            const count = parseInt(args[1], 10);
            if (isNaN(count) || count < 1)
                return await sock.sendMessage(chatId, { text: '❌ مثال: `!تكرار warns 3`', ...channelInfo }, { quoted: message });
            groupConfig.warnCount = count;
            await saveConfig(config);
            return await sock.sendMessage(chatId, { text: `✅ حد التحذيرات: *${count}* تحذير قبل الإجراء.`, ...channelInfo }, { quoted: message });
        }
        
        return await sock.sendMessage(chatId, { text: '❌ أمر غير معروف. استخدم `!تكرار status`', ...channelInfo }, { quoted: message });
    },
    handleAntiSpam,
    invalidateGroupCache
};