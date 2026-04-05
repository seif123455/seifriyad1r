import { downloadMediaMessage } from '@whiskeysockets/baileys';
import fs from 'fs';
import path from 'path';
import { UploadFileUgu, TelegraPh } from '../lib/uploader.js';

async function getMediaBuffer(msg, sock) {
    return await downloadMediaMessage(msg, 'buffer', {}, {
        logger: sock.logger,
        reuploadRequest: sock.updateMediaMessage
    });
}

function getQuotedMessage(message) {
    const ctx = message.message?.extendedTextMessage?.contextInfo;
    if (!ctx?.quotedMessage) return null;
    return {
        key: {
            remoteJid: message.key.remoteJid,
            fromMe: false,
            id: ctx.stanzaId,
            participant: ctx.participant
        },
        message: ctx.quotedMessage
    };
}

function getExtFromMessage(msg) {
    const m = msg.message;
    if (m.imageMessage) return '.jpg';
    if (m.videoMessage) return '.mp4';
    if (m.audioMessage) return '.mp3';
    if (m.stickerMessage) return '.webp';
    if (m.documentMessage) {
        return path.extname(m.documentMessage.fileName || '') || '.bin';
    }
    return null;
}

export default {
    command: 'Ø±Ø§Ø¨Ø·_ÙˆØ³Ø§Ø¦Ø·',
    aliases: ['url', 'geturl', 'mediaurl', 'Ø±Ø§Ø¨Ø·_ØµÙˆØ±Ø©', 'Ø±Ø§Ø¨Ø·_ÙÙŠØ¯ÙŠÙˆ'],
    category: 'Ø£Ø¯ÙˆØ§Øª',
    description: 'Ø§Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ø±Ø§Ø¨Ø· Ù„Ù„ÙˆØ³Ø§Ø¦Ø· (ØµÙˆØ±Ø©ØŒ ÙÙŠØ¯ÙŠÙˆØŒ ØµÙˆØªØŒ Ù…Ù„ØµÙ‚ØŒ Ù…Ù„Ù)',
    usage: '!Ø±Ø§Ø¨Ø·_ÙˆØ³Ø§Ø¦Ø· (Ø£Ø±Ø³Ù„ Ø£Ùˆ Ø±Ø¯ Ø¹Ù„Ù‰ ÙˆØ³Ø§Ø¦Ø·)',
    
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        
        try {
            let targetMsg = null;
            
            if (message.message?.imageMessage ||
                message.message?.videoMessage ||
                message.message?.audioMessage ||
                message.message?.stickerMessage ||
                message.message?.documentMessage) {
                targetMsg = message;
            }
            
            if (!targetMsg) {
                const quoted = getQuotedMessage(message);
                if (quoted) targetMsg = quoted;
            }
            
            if (!targetMsg) {
                return sock.sendMessage(chatId, { 
                    text: 'ðŸ“Ž *ØªØ­ÙˆÙŠÙ„ Ø§Ù„ÙˆØ³Ø§Ø¦Ø· Ø¥Ù„Ù‰ Ø±Ø§Ø¨Ø·*\n\n' +
                        '*Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…:* Ø£Ø±Ø³Ù„ Ø£Ùˆ Ø±Ø¯ Ø¹Ù„Ù‰ ÙˆØ³Ø§Ø¦Ø· (ØµÙˆØ±Ø©ØŒ ÙÙŠØ¯ÙŠÙˆØŒ ØµÙˆØªØŒ Ù…Ù„ØµÙ‚ØŒ Ù…Ù„Ù) Ø¨Ù€ `!Ø±Ø§Ø¨Ø·_ÙˆØ³Ø§Ø¦Ø·`\n\n' +
                        '*Ù…Ø«Ø§Ù„:* Ù‚Ù… Ø¨Ø§Ù„Ø±Ø¯ Ø¹Ù„Ù‰ ØµÙˆØ±Ø© ÙˆØ§ÙƒØªØ¨ `!Ø±Ø§Ø¨Ø·_ÙˆØ³Ø§Ø¦Ø·`' 
                }, { quoted: message });
            }
            
            const ext = getExtFromMessage(targetMsg);
            if (!ext) throw new Error('Ù†ÙˆØ¹ Ø§Ù„ÙˆØ³Ø§Ø¦Ø· ØºÙŠØ± Ù…Ø¯Ø¹ÙˆÙ…');
            
            const buffer = await getMediaBuffer(targetMsg, sock);
            if (!buffer) throw new Error('ÙØ´Ù„ ÙÙŠ ØªØ­Ù…ÙŠÙ„ Ø§Ù„ÙˆØ³Ø§Ø¦Ø·');
            
            const tempDir = path.join(process.cwd(), 'tmp');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
            
            const tempPath = path.join(tempDir, `${Date.now()}${ext}`);
            fs.writeFileSync(tempPath, buffer);
            
            let url = '';
            
            try {
                if (['.jpg', '.png', '.webp'].includes(ext)) {
                    try {
                        url = await TelegraPh(tempPath);
                    } catch {
                        const res = await UploadFileUgu(tempPath);
                        url = typeof res === 'string' ? res : (res.url || res.url_full || '');
                    }
                } else {
                    const res = await UploadFileUgu(tempPath);
                    url = typeof res === 'string' ? res : (res.url || res.url_full || '');
                }
            } finally {
                setTimeout(() => {
                    try { fs.unlinkSync(tempPath); } catch { }
                }, 2000);
            }
            
            if (!url) {
                return sock.sendMessage(chatId, { 
                    text: 'âŒ ÙØ´Ù„ ÙÙŠ Ø±ÙØ¹ Ø§Ù„ÙˆØ³Ø§Ø¦Ø·.' 
                }, { quoted: message });
            }
            
            // ØªØ­Ø¯ÙŠØ¯ Ù†ÙˆØ¹ Ø§Ù„ÙˆØ³Ø§Ø¦Ø· Ù„Ù„Ø±Ø³Ø§Ù„Ø©
            let mediaType = 'ÙˆØ³Ø§Ø¦Ø·';
            if (ext === '.jpg') mediaType = 'ØµÙˆØ±Ø©';
            else if (ext === '.mp4') mediaType = 'ÙÙŠØ¯ÙŠÙˆ';
            else if (ext === '.mp3') mediaType = 'ØµÙˆØª';
            else if (ext === '.webp') mediaType = 'Ù…Ù„ØµÙ‚';
            else if (ext === '.bin') mediaType = 'Ù…Ù„Ù';
            
            await sock.sendMessage(chatId, { 
                text: `ðŸ”— *Ø±Ø§Ø¨Ø· ${mediaType}*\n\n` +
                    `ðŸ“Ž *Ø§Ù„Ø±Ø§Ø¨Ø·:* ${url}\n\n` +
                    `â±ï¸ *ØªØ§Ø±ÙŠØ® Ø§Ù„Ø§Ù†ØªÙ‡Ø§Ø¡:* Ù„Ø§ ÙŠÙ†ØªÙ‡ÙŠ (Ø±Ø§Ø¨Ø· Ø¯Ø§Ø¦Ù…)\n\n` +
                    `ðŸ”¥ *Crazy Seif BOT* | ðŸ“ž 01144534147` 
            }, { quoted: message });
            
        } catch (error) {
            console.error('[Ø±Ø§Ø¨Ø·_ÙˆØ³Ø§Ø¦Ø·] Ø®Ø·Ø£:', error);
            await sock.sendMessage(chatId, { 
                text: 'âŒ ÙØ´Ù„ ÙÙŠ ØªØ­ÙˆÙŠÙ„ Ø§Ù„ÙˆØ³Ø§Ø¦Ø· Ø¥Ù„Ù‰ Ø±Ø§Ø¨Ø·.' 
            }, { quoted: message });
        }
    }
};

