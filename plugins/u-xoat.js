import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import fs from 'fs';
import path from 'path';
import { uploadToX0 } from '../lib/uploaders.js';

export default {
    command: 'Ø±ÙØ¹',
    aliases: ['xoat', 'xo', 'x0at', 'x0', 'upload', 'Ø±ÙØ¹_Ù…Ù„Ù'],
    category: 'upload',
    description: 'Ø±ÙØ¹ Ø§Ù„Ù…Ù„ÙØ§Øª Ø¥Ù„Ù‰ ÙƒØ³0.Ø§Øª (Ø±ÙØ¹ Ù…Ø¬Ù‡ÙˆÙ„)',
    usage: '!Ø±ÙØ¹ (Ø±Ø¯ Ø¹Ù„Ù‰ ÙˆØ³Ø§Ø¦Ø·)',
    
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        
        try {
            const hasMedia = message.message?.imageMessage ||
                message.message?.videoMessage ||
                message.message?.stickerMessage ||
                message.message?.documentMessage;
            
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            
            if (!hasMedia && !quotedMsg) {
                await sock.sendMessage(chatId, { 
                    text: 'ðŸ“¤ *Ø±ÙØ¹ Ø§Ù„Ù…Ù„ÙØ§Øª Ø¥Ù„Ù‰ X0.at*\n\n' +
                        '*Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…:* `!Ø±ÙØ¹` Ù…Ø¹ Ø±Ø¯ Ø¹Ù„Ù‰ Ù…Ù„Ù Ø£Ùˆ Ø¥Ø±Ø³Ø§Ù„ Ù…Ù„Ù Ù…Ø¹ Ø§Ù„Ø£Ù…Ø±\n\n' +
                        '*ÙŠØ¯Ø¹Ù…:* ØµÙˆØ±ØŒ ÙÙŠØ¯ÙŠÙˆÙ‡Ø§ØªØŒ Ù…Ù„ØµÙ‚Ø§ØªØŒ Ù…Ø³ØªÙ†Ø¯Ø§Øª\n\n' +
                        '*Ù…Ø«Ø§Ù„:* Ù‚Ù… Ø¨Ø§Ù„Ø±Ø¯ Ø¹Ù„Ù‰ ØµÙˆØ±Ø© ÙˆØ§ÙƒØªØ¨ `!Ø±ÙØ¹`'
                }, { quoted: message });
                return;
            }
            
            const mediaSource = hasMedia ? message.message : quotedMsg;
            const type = Object.keys(mediaSource).find(key => 
                ['imageMessage', 'videoMessage', 'stickerMessage', 'documentMessage'].includes(key)
            );
            
            if (!type) {
                await sock.sendMessage(chatId, { 
                    text: 'âš ï¸ Ù†ÙˆØ¹ Ø§Ù„Ù…Ù„Ù ØºÙŠØ± Ù…Ø¯Ø¹ÙˆÙ…!' 
                }, { quoted: message });
                return;
            }
            
            await sock.sendMessage(chatId, { 
                text: 'ðŸ“¤ Ø¬Ø§Ø±ÙŠ Ø±ÙØ¹ Ø§Ù„Ù…Ù„Ù Ø¥Ù„Ù‰ X0.at...' 
            }, { quoted: message });
            
            const mediaType = type === 'stickerMessage' ? 'sticker' : type.replace('Message', '');
            const stream = await downloadContentFromMessage(mediaSource[type], mediaType);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            
            let ext = 'bin';
            let fileType = 'Ù…Ù„Ù';
            
            if (type === 'imageMessage') {
                ext = 'jpg';
                fileType = 'ØµÙˆØ±Ø©';
            } else if (type === 'videoMessage') {
                ext = 'mp4';
                fileType = 'ÙÙŠØ¯ÙŠÙˆ';
            } else if (type === 'stickerMessage') {
                ext = 'webp';
                fileType = 'Ù…Ù„ØµÙ‚';
            } else if (mediaSource[type].fileName) {
                ext = mediaSource[type].fileName.split('.').pop() || 'bin';
                fileType = 'Ù…Ø³ØªÙ†Ø¯';
            }
            
            const tempDir = path.join('./temp');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
            
            const tempPath = path.join(tempDir, `x0_${Date.now()}.${ext}`);
            fs.writeFileSync(tempPath, buffer);
            
            const result = await uploadToX0(tempPath);
            
            const sizeKB = (buffer.length / 1024).toFixed(2);
            
            await sock.sendMessage(chatId, {
                text: `âœ… *ØªÙ… Ø±ÙØ¹ ${fileType} Ø¨Ù†Ø¬Ø§Ø­!*\n\n` +
                    `â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”“\n` +
                    `â”ƒ ðŸ“ *Ø§Ù„Ù†ÙˆØ¹:* ${fileType}\n` +
                    `â”ƒ ðŸ“¦ *Ø§Ù„Ø­Ø¬Ù…:* ${sizeKB} ÙƒÙŠÙ„ÙˆØ¨Ø§ÙŠØª\n` +
                    `â”ƒ ðŸ”— *Ø§Ù„Ø±Ø§Ø¨Ø·:* ${result.url}\n` +
                    `â”—â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”›\n\n` +
                    `ðŸ”¥ *Crazy Seif BOT* | ðŸ“ž 01144534147`
            }, { quoted: message });
            
            fs.unlinkSync(tempPath);
            
        } catch (error) {
            console.error('Ø®Ø·Ø£ ÙÙŠ Ø±ÙØ¹ X0.at:', error);
            await sock.sendMessage(chatId, { 
                text: `âŒ ÙØ´Ù„ Ø§Ù„Ø±ÙØ¹: ${error.message}` 
            }, { quoted: message });
        }
    }
};

