import fs from 'fs';
import path from 'path';
import { dataFile } from '../lib/paths.js';
import store from '../lib/lightweight_store.js';

const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);
const configPath = dataFile('autoreplies.json');

async function initConfig() {
    if (HAS_DB) {
        const config = await store.getSetting('global', 'autoreplies');
        return config || { enabled: true, replies: [] };
    } else {
        if (!fs.existsSync(configPath)) {
            const dataDir = path.dirname(configPath);
            if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
            fs.writeFileSync(configPath, JSON.stringify({ enabled: true, replies: [] }, null, 2));
        }
        return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }
}

async function saveConfig(config) {
    if (HAS_DB) {
        await store.saveSetting('global', 'autoreplies', config);
    } else {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    }
}

// التصدير المسمى - مستورد من lib/messageHandler.ts
export async function handleAutoReply(sock, chatId, message, userMessage) {
    try {
        const config = await initConfig();
        if (!config.enabled || !config.replies.length) return false;
        
        const lowerMsg = userMessage.toLowerCase().trim();
        
        for (const reply of config.replies) {
            const trigger = reply.trigger.toLowerCase();
            const matched = reply.exactMatch
                ? lowerMsg === trigger
                : lowerMsg.includes(trigger);
            
            if (matched) {
                const senderName = message.pushName || 'هناك';
                const responseText = reply.response.replace(/\{name\}/gi, senderName);
                
                await sock.sendMessage(chatId, {
                    text: responseText,
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '201144534147@newsletter',
                            newsletterName: 'CRAZY-SEIF',
                            serverMessageId: -1
                        }
                    }
                }, { quoted: message });
                return true;
            }
        }
    } catch (e) {
        console.error('[AUTOREPLY] خطأ:', e.message);
    }
    return false;
}

export { initConfig, saveConfig };

export default {
    command: 'ردود',
    aliases: ['autoreply', 'ar', 'autorespond', 'رد_تلقائي'],
    category: 'owner',
    description: 'تفعيل أو تعطيل نظام الردود التلقائية',
    usage: '!ردود <on|off>',
    ownerOnly: true,
    
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};
        
        try {
            const config = await initConfig();
            const action = args[0]?.toLowerCase();
            
            if (!action) {
                return await sock.sendMessage(chatId, {
                    text: `*🤖 حالة الردود التلقائية*\n\n` +
                        `*الحالة:* ${config.enabled ? '✅ مفعل' : '❌ معطل'}\n` +
                        `*عدد الردود:* ${config.replies.length}\n` +
                        `*التخزين:* ${HAS_DB ? 'قاعدة بيانات' : 'ملفات'}\n\n` +
                        `*الأوامر:*\n` +
                        `• \`!ردود on\` - تفعيل\n` +
                        `• \`!ردود off\` - تعطيل\n` +
                        `• \`!اضف_رد\` - إضافة مشغل جديد\n` +
                        `• \`!حذف_رد\` - حذف مشغل\n` +
                        `• \`!قائمة_الردود\` - عرض جميع المشغلات`,
                    ...channelInfo
                }, { quoted: message });
            }
            
            if (action === 'on' || action === 'enable') {
                if (config.enabled) {
                    return await sock.sendMessage(chatId, {
                        text: '⚠️ *الردود التلقائية مفعلة بالفعل*',
                        ...channelInfo
                    }, { quoted: message });
                }
                
                config.enabled = true;
                await saveConfig(config);
                
                return await sock.sendMessage(chatId, {
                    text: '✅ *تم تفعيل الردود التلقائية!*\n\nسيقوم البوت الآن بالرد على المشغلات المحددة.',
                    ...channelInfo
                }, { quoted: message });
            }
            
            if (action === 'off' || action === 'disable') {
                if (!config.enabled) {
                    return await sock.sendMessage(chatId, {
                        text: '⚠️ *الردود التلقائية معطلة بالفعل*',
                        ...channelInfo
                    }, { quoted: message });
                }
                
                config.enabled = false;
                await saveConfig(config);
                
                return await sock.sendMessage(chatId, {
                    text: '❌ *تم تعطيل الردود التلقائية!*\n\nلن يقوم البوت بالرد على المشغلات.',
                    ...channelInfo
                }, { quoted: message });
            }
            
            return await sock.sendMessage(chatId, {
                text: '❌ *خيار غير صحيح!*\n\nاستخدم: `!ردود on` أو `!ردود off`',
                ...channelInfo
            }, { quoted: message });
            
        } catch (e) {
            console.error('خطأ في أمر الردود التلقائية:', e);
            await sock.sendMessage(chatId, {
                text: '❌ *خطأ في معالجة الأمر!*',
                ...channelInfo
            }, { quoted: message });
        }
    },
    handleAutoReply,
    initConfig,
    saveConfig
};