import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import fs from 'fs';
import path from 'path';
import { uploadToPomf2 } from '../lib/uploaders.js';
export default {
    command: 'بومف',
    aliases: ['lain', 'pomf'],
    category: 'upload',
    description: 'رفع تو بومف.لاين.لا (1جب, بيرمانينت)',
    usage: '.بومف (رد تو وسائط)',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        try {
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quotedMsg) {
                await sock.sendMessage(chatId, { text: 'âš ï¸ Please reply to media!' }, { quoted: message });
                return;
            }
            const type = Object.keys(quotedMsg)[0];
            const supportedTypes = ['imageMessage', 'videoMessage', 'stickerMessage', 'documentMessage'];
            if (!supportedTypes.includes(type)) {
                await sock.sendMessage(chatId, { text: 'âš ï¸ Unsupported type!' }, { quoted: message });
                return;
            }
            await sock.sendMessage(chatId, { text: 'Uploading to Pomf...' }, { quoted: message });
            const mediaType = type === 'stickerMessage' ? 'sticker' : type.replace('Message', '');
            const stream = await downloadContentFromMessage(quotedMsg[type], mediaType);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            let ext = 'bin';
            if (type === 'imageMessage')
                ext = 'jpg';
            else if (type === 'videoMessage')
                ext = 'mp4';
            else if (type === 'stickerMessage')
                ext = 'webp';
            else if (quotedMsg[type].fileName) {
                ext = quotedMsg[type].fileName.split('.').pop() || 'bin';
            }
            const tempDir = path.join('./temp');
            if (!fs.existsSync(tempDir))
                fs.mkdirSync(tempDir, { recursive: true });
            const tempPath = path.join(tempDir, `pomf_${Date.now()}.${ext}`);
            fs.writeFileSync(tempPath, buffer);
            const result = await uploadToPomf2(tempPath);
            await sock.sendMessage(chatId, {
                text: `âœ… *Pomf Upload Success!*\n\nðŸ”— ${result.url}`
            }, { quoted: message });
            fs.unlinkSync(tempPath);
        }
        catch (error) {
            console.error('Pomf Error:', error);
            await sock.sendMessage(chatId, { text: `âŒ Error: ${error.message}` }, { quoted: message });
        }
    }
};




