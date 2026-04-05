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

// â”€â”€ Ù…ØªØªØ¨Ø¹ Ø§Ù„Ø±Ø³Ø§Ø¦Ù„ Ø§Ù„Ù…ÙƒØ±Ø±Ø© â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const tracker = new Map();
const metaCache = new Map();
const META_TTL_MS = 5 * 60 * 1000; // 5 Ø¯Ù‚Ø§Ø¦Ù‚

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

// â”€â”€ Ø¯Ø§Ù„Ø© Ù…Ù†Ø¹ Ø§Ù„ØªÙƒØ±Ø§Ø± Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ© â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
        
        // â”€â”€ ØªÙ… Ø§ÙƒØªØ´Ø§Ù ØªÙƒØ±Ø§Ø± â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        userData.count = 0;
        userData.firstMessageTime = now;
        
        if (groupConfig.action === 'warn') {
            userData.warns++;
            const warnsLeft = groupConfig.warnCount - userData.warns;
            try {
                if (warnsLeft > 0) {
                    await sock.sendMessage(chatId, {
                        text: `âš ï¸ @${senderId.split('@')[0]} *Ù…Ù…Ù†ÙˆØ¹ Ø§Ù„ØªÙƒØ±Ø§Ø±!*\n_ØªØ­Ø°ÙŠØ± ${userData.warns}/${groupConfig.warnCount}. Ø¨Ø§Ù‚ÙŠ ${warnsLeft} ØªØ­Ø°ÙŠØ± Ù‚Ø¨Ù„ Ø§Ù„Ø·Ø±Ø¯._`,
                        mentions: [senderId],
                        ...channelInfo
                    });
                } else {
                    userData.warns = 0;
                    if (!isBotAdmin) {
                        await sock.sendMessage(chatId, {
                            text: `âš ï¸ @${senderId.split('@')[0]} ÙˆØµÙ„ Ù„Ù„Ø­Ø¯ Ø§Ù„Ø£Ù‚ØµÙ‰ Ù…Ù† Ø§Ù„ØªØ­Ø°ÙŠØ±Ø§Øª Ù„ÙƒÙ† Ø§Ù„Ø¨ÙˆØª Ù„ÙŠØ³ Ø£Ø¯Ù…Ù†.`,
                            mentions: [senderId],
                            ...channelInfo
                        });
                    } else {
                        await sock.sendMessage(chatId, {
                            text: `ðŸš« @${senderId.split('@')[0]} ØªÙ… *Ø·Ø±Ø¯Ù‡* Ø¨Ø³Ø¨Ø¨ Ø§Ù„ØªÙƒØ±Ø§Ø± Ø§Ù„Ù…Ø³ØªÙ…Ø±.`,
                            mentions: [senderId],
                            ...channelInfo
                        });
                        await new Promise(r => setTimeout(r, 500));
                        await sock.groupParticipantsUpdate(chatId, [senderId], 'remove');
                    }
                }
            } catch (sendErr) {
                console.error('[ANTISPAM] ÙØ´Ù„ Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„ØªØ­Ø°ÙŠØ±:', sendErr.message);
            }
            return true;
        }
        
        if (groupConfig.action === 'kick') {
            if (!isBotAdmin) {
                await sock.sendMessage(chatId, {
                    text: `âš ï¸ ØªÙƒØ±Ø§Ø± Ù…Ù† @${senderId.split('@')[0]} â€” Ø§Ù„Ø¨ÙˆØª ÙŠØ­ØªØ§Ø¬ ØµÙ„Ø§Ø­ÙŠØ§Øª Ø£Ø¯Ù…Ù† Ù„Ù„Ø·Ø±Ø¯.`,
                    mentions: [senderId],
                    ...channelInfo
                });
            } else {
                await sock.sendMessage(chatId, {
                    text: `ðŸš« @${senderId.split('@')[0]} ØªÙ… Ø·Ø±Ø¯Ù‡ Ø¨Ø³Ø¨Ø¨ Ø§Ù„ØªÙƒØ±Ø§Ø±.`,
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
                    text: `âš ï¸ ØªÙƒØ±Ø§Ø± Ù…Ù† @${senderId.split('@')[0]} â€” Ø§Ù„Ø¨ÙˆØª ÙŠØ­ØªØ§Ø¬ ØµÙ„Ø§Ø­ÙŠØ§Øª Ø£Ø¯Ù…Ù† Ù„Ù„ÙƒØªÙ….`,
                    mentions: [senderId],
                    ...channelInfo
                });
            } else {
                await sock.sendMessage(chatId, {
                    text: `ðŸ”‡ @${senderId.split('@')[0]} ØªÙ… ÙƒØªÙ…Ù‡ Ø¨Ø³Ø¨Ø¨ Ø§Ù„ØªÙƒØ±Ø§Ø±.`,
                    mentions: [senderId],
                    ...channelInfo
                });
                await sock.groupParticipantsUpdate(chatId, [senderId], 'remove');
            }
            return true;
        }
        
        return false;
    } catch (e) {
        console.error('[ANTISPAM] Ø®Ø·Ø£:', e.message);
        return false;
    }
}

// ØªØ­Ø¯ÙŠØ« Ø§Ù„ÙƒØ§Ø´ Ø¹Ù†Ø¯ ØªØºÙŠÙŠØ± Ø§Ù„Ù…Ø´Ø§Ø±ÙƒÙŠÙ†
export function invalidateGroupCache(chatId) {
    metaCache.delete(chatId);
    tracker.delete(chatId);
}

export { loadConfig, saveConfig, DEFAULT_GROUP_CONFIG };

export default {
    command: 'ØªÙƒØ±Ø§Ø±',
    aliases: ['antispam', 'floodprotect', 'antiflood', 'Ù…Ù†Ø¹_Ø§Ù„ØªÙƒØ±Ø§Ø±'],
    category: 'Ø§Ù„Ù…Ø´Ø±ÙÙˆÙ†',
    description: 'Ø¥Ø¹Ø¯Ø§Ø¯ Ø­Ù…Ø§ÙŠØ© Ù…Ù†Ø¹ Ø§Ù„ØªÙƒØ±Ø§Ø± ÙÙŠ Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹Ø©',
    usage: '!ØªÙƒØ±Ø§Ø± ÙˆÙ†/ÙˆÙÙ | !ØªÙƒØ±Ø§Ø± ØªØ¹ÙŠÙŠÙ† <Ø¹Ø¯Ø¯> <Ø«ÙˆØ§Ù†ÙŠ> | !ØªÙƒØ±Ø§Ø± Ø§ÙƒØªÙŠÙˆÙ† <ÙˆØ§Ø±Ù†/Ø·Ø±Ø¯/ÙƒØªÙ…> | !ØªÙƒØ±Ø§Ø± ÙˆØ§Ø±Ù†Ø³ <Ø¹Ø¯Ø¯>',
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
                text: `*ðŸ›¡ï¸ Ø­Ø§Ù„Ø© Ù…Ù†Ø¹ Ø§Ù„ØªÙƒØ±Ø§Ø±*\n\n` +
                    `*Ø§Ù„Ø­Ø§Ù„Ø©:* ${groupConfig.enabled ? 'âœ… Ù…ÙØ¹Ù„' : 'âŒ Ù…Ø¹Ø·Ù„'}\n` +
                    `*Ø§Ù„Ø­Ø¯:* ${groupConfig.maxMessages} Ø±Ø³Ø§Ù„Ø© ÙÙŠ ${groupConfig.windowSeconds} Ø«Ø§Ù†ÙŠØ©\n` +
                    `*Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡:* ${groupConfig.action.toUpperCase()}\n` +
                    `*Ø­Ø¯ Ø§Ù„ØªØ­Ø°ÙŠØ±Ø§Øª:* ${groupConfig.warnCount} ØªØ­Ø°ÙŠØ± Ù‚Ø¨Ù„ Ø§Ù„Ø·Ø±Ø¯\n` +
                    `*Ø§Ù„Ø¨ÙˆØª Ø£Ø¯Ù…Ù†:* ${isBotAdmin ? 'âœ… Ù†Ø¹Ù…' : 'âŒ Ù„Ø§'}\n\n` +
                    `*Ø§Ù„Ø£ÙˆØ§Ù…Ø±:*\n` +
                    `â€¢ \`!ØªÙƒØ±Ø§Ø± on/off\`\n` +
                    `â€¢ \`!ØªÙƒØ±Ø§Ø± set 5 10\` â€” 5 Ø±Ø³Ø§Ø¦Ù„ ÙÙŠ 10 Ø«ÙˆØ§Ù†ÙŠ\n` +
                    `â€¢ \`!ØªÙƒØ±Ø§Ø± action warn/kick/mute\`\n` +
                    `â€¢ \`!ØªÙƒØ±Ø§Ø± warns 3\` â€” ØªØ­Ø°ÙŠØ±Ø§Øª Ù‚Ø¨Ù„ Ø§Ù„Ø·Ø±Ø¯`,
                ...channelInfo
            }, { quoted: message });
        }
        
        if (action === 'on' || action === 'enable') {
            if (groupConfig.enabled)
                return await sock.sendMessage(chatId, { text: 'âš ï¸ Ù…Ù†Ø¹ Ø§Ù„ØªÙƒØ±Ø§Ø± Ù…ÙØ¹Ù„ Ø¨Ø§Ù„ÙØ¹Ù„.', ...channelInfo }, { quoted: message });
            
            if (!isBotAdmin && groupConfig.action !== 'warn') {
                await sock.sendMessage(chatId, { text: `âš ï¸ Ø§Ù„Ø¨ÙˆØª Ù„ÙŠØ³ Ø£Ø¯Ù…Ù† â€” Ù„Ù† ÙŠØ¹Ù…Ù„ Ø§Ù„Ø·Ø±Ø¯/Ø§Ù„ÙƒØªÙ… Ø­ØªÙ‰ ÙŠØµØ¨Ø­ Ø§Ù„Ø¨ÙˆØª Ø£Ø¯Ù…Ù†.`, ...channelInfo }, { quoted: message });
            }
            
            groupConfig.enabled = true;
            await saveConfig(config);
            return await sock.sendMessage(chatId, {
                text: `âœ… *ØªÙ… ØªÙØ¹ÙŠÙ„ Ù…Ù†Ø¹ Ø§Ù„ØªÙƒØ±Ø§Ø±!*\nØ§Ù„Ø­Ø¯: ${groupConfig.maxMessages} Ø±Ø³Ø§Ù„Ø© ÙÙŠ ${groupConfig.windowSeconds} Ø«Ø§Ù†ÙŠØ© | Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡: ${groupConfig.action.toUpperCase()}`,
                ...channelInfo
            }, { quoted: message });
        }
        
        if (action === 'off' || action === 'disable') {
            if (!groupConfig.enabled)
                return await sock.sendMessage(chatId, { text: 'âš ï¸ Ù…Ù†Ø¹ Ø§Ù„ØªÙƒØ±Ø§Ø± Ù…Ø¹Ø·Ù„ Ø¨Ø§Ù„ÙØ¹Ù„.', ...channelInfo }, { quoted: message });
            
            groupConfig.enabled = false;
            await saveConfig(config);
            return await sock.sendMessage(chatId, { text: 'âŒ *ØªÙ… ØªØ¹Ø·ÙŠÙ„ Ù…Ù†Ø¹ Ø§Ù„ØªÙƒØ±Ø§Ø±.*', ...channelInfo }, { quoted: message });
        }
        
        if (action === 'set') {
            const maxMsgs = parseInt(args[1], 10);
            const windowSec = parseInt(args[2], 10);
            if (isNaN(maxMsgs) || isNaN(windowSec) || maxMsgs < 2 || windowSec < 1) {
                return await sock.sendMessage(chatId, { text: 'âŒ Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…: `!ØªÙƒØ±Ø§Ø± set <Ø±Ø³Ø§Ø¦Ù„> <Ø«ÙˆØ§Ù†ÙŠ>`\nÙ…Ø«Ø§Ù„: `!ØªÙƒØ±Ø§Ø± set 5 10`', ...channelInfo }, { quoted: message });
            }
            groupConfig.maxMessages = maxMsgs;
            groupConfig.windowSeconds = windowSec;
            await saveConfig(config);
            return await sock.sendMessage(chatId, { text: `âœ… ØªÙ… Ø¶Ø¨Ø· Ø§Ù„Ø­Ø¯: *${maxMsgs} Ø±Ø³Ø§Ù„Ø©* ÙÙŠ *${windowSec} Ø«Ø§Ù†ÙŠØ©*`, ...channelInfo }, { quoted: message });
        }
        
        if (action === 'action') {
            const newAction = args[1]?.toLowerCase();
            if (!['warn', 'kick', 'mute'].includes(newAction)) {
                return await sock.sendMessage(chatId, { text: 'âŒ Ø§Ø®ØªØ±: `warn`, `kick`, Ø£Ùˆ `mute`', ...channelInfo }, { quoted: message });
            }
            if (newAction !== 'warn' && !isBotAdmin) {
                await sock.sendMessage(chatId, { text: `âš ï¸ ØªÙ… Ø¶Ø¨Ø· Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡ Ø¹Ù„Ù‰ *${newAction.toUpperCase()}* Ù„ÙƒÙ† Ø§Ù„Ø¨ÙˆØª ÙŠØ­ØªØ§Ø¬ ØµÙ„Ø§Ø­ÙŠØ§Øª Ø£Ø¯Ù…Ù†.`, ...channelInfo }, { quoted: message });
            }
            groupConfig.action = newAction;
            await saveConfig(config);
            return await sock.sendMessage(chatId, { text: `âœ… Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡: *${newAction.toUpperCase()}*`, ...channelInfo }, { quoted: message });
        }
        
        if (action === 'warns') {
            const count = parseInt(args[1], 10);
            if (isNaN(count) || count < 1)
                return await sock.sendMessage(chatId, { text: 'âŒ Ù…Ø«Ø§Ù„: `!ØªÙƒØ±Ø§Ø± warns 3`', ...channelInfo }, { quoted: message });
            groupConfig.warnCount = count;
            await saveConfig(config);
            return await sock.sendMessage(chatId, { text: `âœ… Ø­Ø¯ Ø§Ù„ØªØ­Ø°ÙŠØ±Ø§Øª: *${count}* ØªØ­Ø°ÙŠØ± Ù‚Ø¨Ù„ Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡.`, ...channelInfo }, { quoted: message });
        }
        
        return await sock.sendMessage(chatId, { text: 'âŒ Ø£Ù…Ø± ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙ. Ø§Ø³ØªØ®Ø¯Ù… `!ØªÙƒØ±Ø§Ø± status`', ...channelInfo }, { quoted: message });
    },
    handleAntiSpam,
    invalidateGroupCache
};

