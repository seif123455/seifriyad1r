import fs from 'fs';
import path from 'path';
import { dataFile } from '../lib/paths.js';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { writeFile } from 'fs/promises';
import store from '../lib/lightweight_store.js';

const messageStore = new Map();
const CONFIG_PATH = dataFile('antidelete.json');
const TEMP_MEDIA_DIR = path.join(process.cwd(), 'temp');
const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);

if (!fs.existsSync(TEMP_MEDIA_DIR)) {
    fs.mkdirSync(TEMP_MEDIA_DIR, { recursive: true });
}

const getFolderSizeInMB = (folderPath) => {
    try {
        const files = fs.readdirSync(folderPath);
        let totalSize = 0;
        for (const file of files) {
            const filePath = path.join(folderPath, file);
            if (fs.statSync(filePath).isFile()) {
                totalSize += fs.statSync(filePath).size;
            }
        }
        return totalSize / (1024 * 1024);
    } catch (err) {
        console.error('خطأ في حساب حجم المجلد:', err);
        return 0;
    }
};

const cleanTempFolderIfLarge = () => {
    try {
        const sizeMB = getFolderSizeInMB(TEMP_MEDIA_DIR);
        if (sizeMB > 200) {
            const files = fs.readdirSync(TEMP_MEDIA_DIR);
            for (const file of files) {
                const filePath = path.join(TEMP_MEDIA_DIR, file);
                fs.unlinkSync(filePath);
            }
        }
    } catch (err) {
        console.error('خطأ في تنظيف المجلد المؤقت:', err);
    }
};

setInterval(cleanTempFolderIfLarge, 60 * 1000);

async function loadAntideleteConfig() {
    try {
        if (HAS_DB) {
            const config = await store.getSetting('global', 'antidelete');
            return config || { enabled: false };
        } else {
            if (!fs.existsSync(CONFIG_PATH)) return { enabled: false };
            return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
        }
    } catch {
        return { enabled: false };
    }
}

async function saveAntideleteConfig(config) {
    try {
        if (HAS_DB) {
            await store.saveSetting('global', 'antidelete', config);
        } else {
            fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
        }
    } catch (err) {
        console.error('خطأ في حفظ الإعدادات:', err);
    }
}

export async function storeMessage(sock, message) {
    try {
        const config = await loadAntideleteConfig();
        if (!config.enabled) return;
        if (!message.key?.id) return;
        
        const messageId = message.key.id;
        let content = '';
        let mediaType = '';
        let mediaPath = '';
        let isViewOnce = false;
        const sender = message.key.participant || message.key.remoteJid;
        const viewOnceContainer = message.message?.viewOnceMessageV2?.message || message.message?.viewOnceMessage?.message;
        
        if (viewOnceContainer) {
            if (viewOnceContainer.imageMessage) {
                mediaType = 'صورة';
                content = viewOnceContainer.imageMessage.caption || '';
                const stream = await downloadContentFromMessage(viewOnceContainer.imageMessage, 'image');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }
                mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.jpg`);
                await writeFile(mediaPath, buffer);
                isViewOnce = true;
            } else if (viewOnceContainer.videoMessage) {
                mediaType = 'فيديو';
                content = viewOnceContainer.videoMessage.caption || '';
                const stream = await downloadContentFromMessage(viewOnceContainer.videoMessage, 'video');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }
                mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.mp4`);
                await writeFile(mediaPath, buffer);
                isViewOnce = true;
            }
        } else if (message.message?.conversation) {
            content = message.message.conversation;
        } else if (message.message?.extendedTextMessage?.text) {
            content = message.message.extendedTextMessage.text;
        } else if (message.message?.imageMessage) {
            mediaType = 'صورة';
            content = message.message.imageMessage.caption || '';
            const stream = await downloadContentFromMessage(message.message.imageMessage, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.jpg`);
            await writeFile(mediaPath, buffer);
        } else if (message.message?.stickerMessage) {
            mediaType = 'ملصق';
            const stream = await downloadContentFromMessage(message.message.stickerMessage, 'sticker');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.webp`);
            await writeFile(mediaPath, buffer);
        } else if (message.message?.videoMessage) {
            mediaType = 'فيديو';
            content = message.message.videoMessage.caption || '';
            const stream = await downloadContentFromMessage(message.message.videoMessage, 'video');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.mp4`);
            await writeFile(mediaPath, buffer);
        } else if (message.message?.audioMessage) {
            mediaType = 'صوت';
            const mime = message.message.audioMessage.mimetype || '';
            const ext = mime.includes('mpeg') ? 'mp3' : (mime.includes('ogg') ? 'ogg' : 'mp3');
            const stream = await downloadContentFromMessage(message.message.audioMessage, 'audio');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.${ext}`);
            await writeFile(mediaPath, buffer);
        }
        
        messageStore.set(messageId, {
            content,
            mediaType,
            mediaPath,
            sender,
            group: message.key.remoteJid.endsWith('@g.us') ? message.key.remoteJid : null,
            timestamp: new Date().toISOString()
        });
        
        if (isViewOnce && mediaType && fs.existsSync(mediaPath)) {
            try {
                const ownerNumber = `${sock.user.id.split(':')[0]}@s.whatsapp.net`;
                const senderName = sender.split('@')[0];
                const mediaOptions = {
                    caption: `*📸 صورة مرة واحدة*\nمن: @${senderName}`,
                    mentions: [sender]
                };
                if (mediaType === 'صورة') {
                    await sock.sendMessage(ownerNumber, { image: { url: mediaPath }, ...mediaOptions });
                } else if (mediaType === 'فيديو') {
                    await sock.sendMessage(ownerNumber, { video: { url: mediaPath }, ...mediaOptions });
                }
                try { fs.unlinkSync(mediaPath); } catch { }
            } catch (e) { }
        }
    } catch (err) {
        console.error('خطأ في حفظ الرسالة:', err);
    }
}

export async function handleMessageRevocation(sock, revocationMessage) {
    try {
        const config = await loadAntideleteConfig();
        if (!config.enabled) return;
        
        const messageId = revocationMessage.message.protocolMessage.key.id;
        const deletedBy = revocationMessage.participant || revocationMessage.key.participant || revocationMessage.key.remoteJid;
        const ownerNumber = `${sock.user.id.split(':')[0]}@s.whatsapp.net`;
        
        if (deletedBy.includes(sock.user.id) || deletedBy === ownerNumber) return;
        
        const original = messageStore.get(messageId);
        if (!original) return;
        
        const sender = original.sender;
        const senderName = sender.split('@')[0];
        const groupName = original.group ? (await sock.groupMetadata(original.group)).subject : '';
        const time = new Date().toLocaleString('ar-EG', {
            timeZone: process.env.TIMEZONE || 'Africa/Cairo',
            hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit',
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
        
        let text = `*🔰 تقرير مكافحة الحذف 🔰*\n\n` +
            `*🗑️ حذف بواسطة:* @${deletedBy.split('@')[0]}\n` +
            `*👤 المرسل:* @${senderName}\n` +
            `*📱 الرقم:* ${sender}\n` +
            `*🕒 الوقت:* ${time}\n`;
        if (groupName) text += `*👥 المجموعة:* ${groupName}\n`;
        if (original.content) {
            text += `\n*💬 الرسالة المحذوفة:*\n${original.content}`;
        }
        
        await sock.sendMessage(ownerNumber, {
            text,
            mentions: [deletedBy, sender]
        });
        
        if (original.mediaType && fs.existsSync(original.mediaPath)) {
            const mediaOptions = {
                caption: `*${original.mediaType} محذوفة*\nمن: @${senderName}`,
                mentions: [sender]
            };
            try {
                switch (original.mediaType) {
                    case 'صورة':
                        await sock.sendMessage(ownerNumber, { image: { url: original.mediaPath }, ...mediaOptions });
                        break;
                    case 'ملصق':
                        await sock.sendMessage(ownerNumber, { sticker: { url: original.mediaPath }, ...mediaOptions });
                        break;
                    case 'فيديو':
                        await sock.sendMessage(ownerNumber, { video: { url: original.mediaPath }, ...mediaOptions });
                        break;
                    case 'صوت':
                        await sock.sendMessage(ownerNumber, { audio: { url: original.mediaPath }, mimetype: 'audio/mpeg', ptt: false, ...mediaOptions });
                        break;
                }
            } catch (err) {
                await sock.sendMessage(ownerNumber, { text: `⚠️ خطأ في إرسال الوسائط: ${err.message}` });
            }
            try { fs.unlinkSync(original.mediaPath); } catch (err) { console.error('خطأ في حذف الوسائط:', err); }
        }
        messageStore.delete(messageId);
    } catch (err) {
        console.error('خطأ في معالجة الحذف:', err);
    }
}

export default {
    command: 'حذف',
    aliases: ['antidelete', 'antidel', 'adel', 'مكافحة_الحذف'],
    category: 'owner',
    description: 'تفعيل أو تعطيل ميزة تتبع الرسائل المحذوفة',
    usage: '!حذف <on|off>',
    ownerOnly: true,
    
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const config = await loadAntideleteConfig();
        const action = args[0]?.toLowerCase();
        
        if (!action) {
            await sock.sendMessage(chatId, {
                text: `*🔰 إعدادات مكافحة الحذف 🔰*\n\n` +
                    `*الحالة:* ${config.enabled ? '✅ مفعل' : '❌ معطل'}\n` +
                    `*التخزين:* ${HAS_DB ? 'قاعدة بيانات' : 'ملفات'}\n\n` +
                    `*الأوامر:*\n` +
                    `• \`!حذف on\` - تفعيل\n` +
                    `• \`!حذف off\` - تعطيل\n\n` +
                    `*المميزات:*\n` +
                    `• تتبع الرسائل المحذوفة\n` +
                    `• حفظ الوسائط المحذوفة\n` +
                    `• حفظ صور/فيديوهات مرة واحدة\n` +
                    `• إرسال التقارير للمالك`
            }, { quoted: message });
            return;
        }
        
        if (action === 'on') {
            config.enabled = true;
            await saveAntideleteConfig(config);
            await sock.sendMessage(chatId, {
                text: `✅ *تم تفعيل مكافحة الحذف!*\n\n` +
                    `التخزين: ${HAS_DB ? 'قاعدة بيانات' : 'ملفات'}\n\n` +
                    `البوت الآن سوف:\n` +
                    `• تتبع جميع الرسائل\n` +
                    `• مراقبة الرسائل المحذوفة\n` +
                    `• حفظ صور/فيديوهات مرة واحدة\n` +
                    `• إرسال تقارير الحذف للمالك`
            }, { quoted: message });
        } else if (action === 'off') {
            config.enabled = false;
            await saveAntideleteConfig(config);
            await sock.sendMessage(chatId, {
                text: `❌ *تم تعطيل مكافحة الحذف!*\n\n` +
                    `لن يقوم البوت بتتبع الرسائل المحذوفة.`
            }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, {
                text: '❌ *أمر غير صحيح*\n\nاستخدم: `!حذف on/off`'
            }, { quoted: message });
        }
    },
    handleMessageRevocation,
    storeMessage,
    loadAntideleteConfig,
    saveAntideleteConfig
};