import fs from 'fs';
import path from 'path';
import { dataFile } from '../lib/paths.js';
import store from '../lib/lightweight_store.js';

const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);
const configPath = dataFile('autoread.json');

async function initConfig() {
    if (HAS_DB) {
        const config = await store.getSetting('global', 'autoread');
        return config || { enabled: false };
    } else {
        if (!fs.existsSync(configPath)) {
            const dataDir = path.dirname(configPath);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }
            fs.writeFileSync(configPath, JSON.stringify({ enabled: false }, null, 2));
        }
        return JSON.parse(fs.readFileSync(configPath, "utf-8"));
    }
}

async function saveConfig(config) {
    if (HAS_DB) {
        await store.saveSetting('global', 'autoread', config);
    } else {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    }
}

async function isAutoreadEnabled() {
    try {
        const config = await initConfig();
        return config.enabled;
    } catch (error) {
        console.error('خطأ في التحقق من حالة القراءة التلقائية:', error);
        return false;
    }
}

function isBotMentionedInMessage(message, botNumber) {
    if (!message.message) return false;
    
    const messageTypes = [
        'extendedTextMessage', 'imageMessage', 'videoMessage', 'stickerMessage',
        'documentMessage', 'audioMessage', 'contactMessage', 'locationMessage'
    ];
    
    for (const type of messageTypes) {
        if (message.message[type]?.contextInfo?.mentionedJid) {
            const mentionedJid = message.message[type].contextInfo.mentionedJid;
            if (mentionedJid.some((jid) => jid === botNumber)) {
                return true;
            }
        }
    }
    
    const textContent = message.message.conversation ||
        message.message.extendedTextMessage?.text ||
        message.message.imageMessage?.caption ||
        message.message.videoMessage?.caption || '';
    
    if (textContent) {
        const botUsername = botNumber.split('@')[0];
        if (textContent.includes(`@${botUsername}`)) {
            return true;
        }
        
        const botNames = [global.botname?.toLowerCase(), 'bot', 'mega', 'crazy'];
        const words = textContent.toLowerCase().split(/\s+/);
        if (botNames.some(name => words.includes(name))) {
            return true;
        }
    }
    return false;
}

export async function handleAutoread(sock, message) {
    try {
        const ghostMode = await store.getSetting('global', 'stealthMode');
        if (ghostMode && ghostMode.enabled) {
            console.log('👻 الوضع الخفي نشط - تخطي إشعار القراءة');
            return false;
        }
    } catch (err) { }
    
    const enabled = await isAutoreadEnabled();
    if (enabled) {
        const botNumber = `${sock.user.id.split(':')[0]}@s.whatsapp.net`;
        const isBotMentioned = isBotMentionedInMessage(message, botNumber);
        
        if (isBotMentioned) {
            return false;
        } else {
            try {
                const key = {
                    remoteJid: message.key.remoteJid,
                    id: message.key.id,
                    participant: message.key.participant
                };
                await sock.readMessages([key]);
                return true;
            } catch (error) {
                console.error('خطأ في تحديد الرسالة كمقروءة:', error);
                return false;
            }
        }
    }
    return false;
}

export default {
    command: 'قراءة',
    aliases: ['autoread', 'read', 'autoreadmsg', 'تلقائي_قراءة'],
    category: 'owner',
    description: 'تفعيل أو تعطيل القراءة التلقائية للرسائل',
    usage: '!قراءة <on|off>',
    ownerOnly: true,
    
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};
        
        try {
            const config = await initConfig();
            const action = args[0]?.toLowerCase();
            
            if (!action) {
                const ghostMode = await store.getSetting('global', 'stealthMode');
                const ghostActive = ghostMode && ghostMode.enabled;
                
                await sock.sendMessage(chatId, {
                    text: `*📖 حالة القراءة التلقائية*\n\n` +
                        `*الحالة:* ${config.enabled ? '✅ مفعل' : '❌ معطل'}\n` +
                        `*الوضع الخفي:* ${ghostActive ? '👻 نشط (يتجاوز القراءة التلقائية)' : '❌ غير نشط'}\n` +
                        `*التخزين:* ${HAS_DB ? 'قاعدة بيانات' : 'ملفات'}\n\n` +
                        `*الأوامر:*\n` +
                        `• \`!قراءة on\` - تفعيل القراءة التلقائية\n` +
                        `• \`!قراءة off\` - تعطيل القراءة التلقائية\n\n` +
                        `*ماذا يفعل:*\n` +
                        `عند التفعيل، يقوم البوت بوضع علامة مقروءة على جميع الرسائل تلقائياً.\n\n` +
                        `*ملاحظة:* الوضع الخفي له أولوية على القراءة التلقائية.`,
                    ...channelInfo
                }, { quoted: message });
                return;
            }
            
            if (action === 'on' || action === 'enable') {
                if (config.enabled) {
                    await sock.sendMessage(chatId, {
                        text: '⚠️ *القراءة التلقائية مفعلة بالفعل*',
                        ...channelInfo
                    }, { quoted: message });
                    return;
                }
                
                config.enabled = true;
                await saveConfig(config);
                
                const ghostMode = await store.getSetting('global', 'stealthMode');
                const ghostActive = ghostMode && ghostMode.enabled;
                
                await sock.sendMessage(chatId, {
                    text: `✅ *تم تفعيل القراءة التلقائية!*\n\nسيتم وضع علامة مقروءة على جميع الرسائل تلقائياً.${ghostActive ? '\n\n⚠️ *ملاحظة:* الوضع الخفي نشط حالياً وسيتجاوز هذه الخاصية.' : ''}`,
                    ...channelInfo
                }, { quoted: message });
                
            } else if (action === 'off' || action === 'disable') {
                if (!config.enabled) {
                    await sock.sendMessage(chatId, {
                        text: '⚠️ *القراءة التلقائية معطلة بالفعل*',
                        ...channelInfo
                    }, { quoted: message });
                    return;
                }
                
                config.enabled = false;
                await saveConfig(config);
                
                await sock.sendMessage(chatId, {
                    text: '❌ *تم تعطيل القراءة التلقائية!*\n\nلن يتم وضع علامة مقروءة على الرسائل تلقائياً.',
                    ...channelInfo
                }, { quoted: message });
                
            } else {
                await sock.sendMessage(chatId, {
                    text: '❌ *خيار غير صحيح!*\n\nاستخدم: `!قراءة on/off`',
                    ...channelInfo
                }, { quoted: message });
            }
            
        } catch (error) {
            console.error('خطأ في أمر القراءة التلقائية:', error);
            await sock.sendMessage(chatId, {
                text: '❌ *خطأ في معالجة الأمر!*',
                ...channelInfo
            }, { quoted: message });
        }
    },
    isAutoreadEnabled,
    isBotMentionedInMessage,
    handleAutoread
};