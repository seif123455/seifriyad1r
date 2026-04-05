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
        console.error('Ø®Ø·Ø£ ÙÙŠ Ø­Ø³Ø§Ø¨ Ø­Ø¬Ù… Ø§Ù„Ù…Ø¬Ù„Ø¯:', err);
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
        console.error('Ø®Ø·Ø£ ÙÙŠ ØªÙ†Ø¸ÙŠÙ Ø§Ù„Ù…Ø¬Ù„Ø¯ Ø§Ù„Ù…Ø¤Ù‚Øª:', err);
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
        console.error('Ø®Ø·Ø£ ÙÙŠ Ø­ÙØ¸ Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª:', err);
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
                mediaType = 'ØµÙˆØ±Ø©';
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
                mediaType = 'ÙÙŠØ¯ÙŠÙˆ';
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
            mediaType = 'ØµÙˆØ±Ø©';
            content = message.message.imageMessage.caption || '';
            const stream = await downloadContentFromMessage(message.message.imageMessage, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.jpg`);
            await writeFile(mediaPath, buffer);
        } else if (message.message?.stickerMessage) {
            mediaType = 'Ù…Ù„ØµÙ‚';
            const stream = await downloadContentFromMessage(message.message.stickerMessage, 'sticker');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.webp`);
            await writeFile(mediaPath, buffer);
        } else if (message.message?.videoMessage) {
            mediaType = 'ÙÙŠØ¯ÙŠÙˆ';
            content = message.message.videoMessage.caption || '';
            const stream = await downloadContentFromMessage(message.message.videoMessage, 'video');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.mp4`);
            await writeFile(mediaPath, buffer);
        } else if (message.message?.audioMessage) {
            mediaType = 'ØµÙˆØª';
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
                    caption: `*ðŸ“¸ ØµÙˆØ±Ø© Ù…Ø±Ø© ÙˆØ§Ø­Ø¯Ø©*\nÙ…Ù†: @${senderName}`,
                    mentions: [sender]
                };
                if (mediaType === 'ØµÙˆØ±Ø©') {
                    await sock.sendMessage(ownerNumber, { image: { url: mediaPath }, ...mediaOptions });
                } else if (mediaType === 'ÙÙŠØ¯ÙŠÙˆ') {
                    await sock.sendMessage(ownerNumber, { video: { url: mediaPath }, ...mediaOptions });
                }
                try { fs.unlinkSync(mediaPath); } catch { }
            } catch (e) { }
        }
    } catch (err) {
        console.error('Ø®Ø·Ø£ ÙÙŠ Ø­ÙØ¸ Ø§Ù„Ø±Ø³Ø§Ù„Ø©:', err);
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
        
        let text = `*ðŸ”° ØªÙ‚Ø±ÙŠØ± Ù…ÙƒØ§ÙØ­Ø© Ø§Ù„Ø­Ø°Ù ðŸ”°*\n\n` +
            `*ðŸ—‘ï¸ Ø­Ø°Ù Ø¨ÙˆØ§Ø³Ø·Ø©:* @${deletedBy.split('@')[0]}\n` +
            `*ðŸ‘¤ Ø§Ù„Ù…Ø±Ø³Ù„:* @${senderName}\n` +
            `*ðŸ“± Ø§Ù„Ø±Ù‚Ù…:* ${sender}\n` +
            `*ðŸ•’ Ø§Ù„ÙˆÙ‚Øª:* ${time}\n`;
        if (groupName) text += `*ðŸ‘¥ Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹Ø©:* ${groupName}\n`;
        if (original.content) {
            text += `\n*ðŸ’¬ Ø§Ù„Ø±Ø³Ø§Ù„Ø© Ø§Ù„Ù…Ø­Ø°ÙˆÙØ©:*\n${original.content}`;
        }
        
        await sock.sendMessage(ownerNumber, {
            text,
            mentions: [deletedBy, sender]
        });
        
        if (original.mediaType && fs.existsSync(original.mediaPath)) {
            const mediaOptions = {
                caption: `*${original.mediaType} Ù…Ø­Ø°ÙˆÙØ©*\nÙ…Ù†: @${senderName}`,
                mentions: [sender]
            };
            try {
                switch (original.mediaType) {
                    case 'ØµÙˆØ±Ø©':
                        await sock.sendMessage(ownerNumber, { image: { url: original.mediaPath }, ...mediaOptions });
                        break;
                    case 'Ù…Ù„ØµÙ‚':
                        await sock.sendMessage(ownerNumber, { sticker: { url: original.mediaPath }, ...mediaOptions });
                        break;
                    case 'ÙÙŠØ¯ÙŠÙˆ':
                        await sock.sendMessage(ownerNumber, { video: { url: original.mediaPath }, ...mediaOptions });
                        break;
                    case 'ØµÙˆØª':
                        await sock.sendMessage(ownerNumber, { audio: { url: original.mediaPath }, mimetype: 'audio/mpeg', ptt: false, ...mediaOptions });
                        break;
                }
            } catch (err) {
                await sock.sendMessage(ownerNumber, { text: `âš ï¸ Ø®Ø·Ø£ ÙÙŠ Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„ÙˆØ³Ø§Ø¦Ø·: ${err.message}` });
            }
            try { fs.unlinkSync(original.mediaPath); } catch (err) { console.error('Ø®Ø·Ø£ ÙÙŠ Ø­Ø°Ù Ø§Ù„ÙˆØ³Ø§Ø¦Ø·:', err); }
        }
        messageStore.delete(messageId);
    } catch (err) {
        console.error('Ø®Ø·Ø£ ÙÙŠ Ù…Ø¹Ø§Ù„Ø¬Ø© Ø§Ù„Ø­Ø°Ù:', err);
    }
}

export default {
    command: 'Ø­Ø°Ù',
    aliases: ['antidelete', 'antidel', 'adel', 'Ù…ÙƒØ§ÙØ­Ø©_Ø§Ù„Ø­Ø°Ù'],
    category: 'Ø§Ù„Ù…Ø§Ù„Ùƒ',
    description: 'ØªÙØ¹ÙŠÙ„ Ø£Ùˆ ØªØ¹Ø·ÙŠÙ„ Ù…ÙŠØ²Ø© ØªØªØ¨Ø¹ Ø§Ù„Ø±Ø³Ø§Ø¦Ù„ Ø§Ù„Ù…Ø­Ø°ÙˆÙØ©',
    usage: '!Ø­Ø°Ù <ÙˆÙ†|ÙˆÙÙ>',
    ownerOnly: true,
    
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const config = await loadAntideleteConfig();
        const action = args[0]?.toLowerCase();
        
        if (!action) {
            await sock.sendMessage(chatId, {
                text: `*ðŸ”° Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ù…ÙƒØ§ÙØ­Ø© Ø§Ù„Ø­Ø°Ù ðŸ”°*\n\n` +
                    `*Ø§Ù„Ø­Ø§Ù„Ø©:* ${config.enabled ? 'âœ… Ù…ÙØ¹Ù„' : 'âŒ Ù…Ø¹Ø·Ù„'}\n` +
                    `*Ø§Ù„ØªØ®Ø²ÙŠÙ†:* ${HAS_DB ? 'Ù‚Ø§Ø¹Ø¯Ø© Ø¨ÙŠØ§Ù†Ø§Øª' : 'Ù…Ù„ÙØ§Øª'}\n\n` +
                    `*Ø§Ù„Ø£ÙˆØ§Ù…Ø±:*\n` +
                    `â€¢ \`!Ø­Ø°Ù on\` - ØªÙØ¹ÙŠÙ„\n` +
                    `â€¢ \`!Ø­Ø°Ù off\` - ØªØ¹Ø·ÙŠÙ„\n\n` +
                    `*Ø§Ù„Ù…Ù…ÙŠØ²Ø§Øª:*\n` +
                    `â€¢ ØªØªØ¨Ø¹ Ø§Ù„Ø±Ø³Ø§Ø¦Ù„ Ø§Ù„Ù…Ø­Ø°ÙˆÙØ©\n` +
                    `â€¢ Ø­ÙØ¸ Ø§Ù„ÙˆØ³Ø§Ø¦Ø· Ø§Ù„Ù…Ø­Ø°ÙˆÙØ©\n` +
                    `â€¢ Ø­ÙØ¸ ØµÙˆØ±/ÙÙŠØ¯ÙŠÙˆÙ‡Ø§Øª Ù…Ø±Ø© ÙˆØ§Ø­Ø¯Ø©\n` +
                    `â€¢ Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„ØªÙ‚Ø§Ø±ÙŠØ± Ù„Ù„Ù…Ø§Ù„Ùƒ`
            }, { quoted: message });
            return;
        }
        
        if (action === 'on') {
            config.enabled = true;
            await saveAntideleteConfig(config);
            await sock.sendMessage(chatId, {
                text: `âœ… *ØªÙ… ØªÙØ¹ÙŠÙ„ Ù…ÙƒØ§ÙØ­Ø© Ø§Ù„Ø­Ø°Ù!*\n\n` +
                    `Ø§Ù„ØªØ®Ø²ÙŠÙ†: ${HAS_DB ? 'Ù‚Ø§Ø¹Ø¯Ø© Ø¨ÙŠØ§Ù†Ø§Øª' : 'Ù…Ù„ÙØ§Øª'}\n\n` +
                    `Ø§Ù„Ø¨ÙˆØª Ø§Ù„Ø¢Ù† Ø³ÙˆÙ:\n` +
                    `â€¢ ØªØªØ¨Ø¹ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø±Ø³Ø§Ø¦Ù„\n` +
                    `â€¢ Ù…Ø±Ø§Ù‚Ø¨Ø© Ø§Ù„Ø±Ø³Ø§Ø¦Ù„ Ø§Ù„Ù…Ø­Ø°ÙˆÙØ©\n` +
                    `â€¢ Ø­ÙØ¸ ØµÙˆØ±/ÙÙŠØ¯ÙŠÙˆÙ‡Ø§Øª Ù…Ø±Ø© ÙˆØ§Ø­Ø¯Ø©\n` +
                    `â€¢ Ø¥Ø±Ø³Ø§Ù„ ØªÙ‚Ø§Ø±ÙŠØ± Ø§Ù„Ø­Ø°Ù Ù„Ù„Ù…Ø§Ù„Ùƒ`
            }, { quoted: message });
        } else if (action === 'off') {
            config.enabled = false;
            await saveAntideleteConfig(config);
            await sock.sendMessage(chatId, {
                text: `âŒ *ØªÙ… ØªØ¹Ø·ÙŠÙ„ Ù…ÙƒØ§ÙØ­Ø© Ø§Ù„Ø­Ø°Ù!*\n\n` +
                    `Ù„Ù† ÙŠÙ‚ÙˆÙ… Ø§Ù„Ø¨ÙˆØª Ø¨ØªØªØ¨Ø¹ Ø§Ù„Ø±Ø³Ø§Ø¦Ù„ Ø§Ù„Ù…Ø­Ø°ÙˆÙØ©.`
            }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, {
                text: 'âŒ *Ø£Ù…Ø± ØºÙŠØ± ØµØ­ÙŠØ­*\n\nØ§Ø³ØªØ®Ø¯Ù…: `!Ø­Ø°Ù on/off`'
            }, { quoted: message });
        }
    },
    handleMessageRevocation,
    storeMessage,
    loadAntideleteConfig,
    saveAntideleteConfig
};

