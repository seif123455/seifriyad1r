import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import fs from 'fs';
import path from 'path';
import { uploadFile } from '../lib/uploaders.js';
export default {
    command: 'اوبلواد',
    aliases: ['upall', 'aup', 'toall', 'aupload'],
    category: 'upload',
    description: 'رفع وسائط تو كلوود اند جلب رابط',
    usage: '.ارفع (رد تو صورة/فيديو/صورة متحركة/ملصق)',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        try {
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quotedMsg) {
                await sock.sendMessage(chatId, { text: 'âš ï¸ Please reply to an image, video, GIF, or sticker!' }, { quoted: message });
                return;
            }
            const type = Object.keys(quotedMsg)[0];
            const supportedTypes = ['imageMessage', 'videoMessage', 'stickerMessage', 'documentMessage'];
            if (!supportedTypes.includes(type)) {
                await sock.sendMessage(chatId, { text: 'âš ï¸ Unsupported file type! Reply to image/video/gif/sticker/document' }, { quoted: message });
                return;
            }
            await sock.sendMessage(chatId, { text: 'Uploading to cloud...' }, { quoted: message });
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
            else if (type === 'documentMessage') {
                const fileName = quotedMsg[type].fileName || 'file';
                ext = fileName.split('.').pop() || 'bin';
            }
            const tempDir = path.join('./temp');
            if (!fs.existsSync(tempDir))
                fs.mkdirSync(tempDir, { recursive: true });
            const tempPath = path.join(tempDir, `upload_${Date.now()}.${ext}`);
            fs.writeFileSync(tempPath, buffer);
            const stats = fs.statSync(tempPath);
            const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
            const result = await uploadFile(tempPath);
            await sock.sendMessage(chatId, {
                text: `âœ… *Upload Successful!*\n\n` +
                    `ðŸ“Š *Service:* ${result.service}\n` +
                    `ðŸ“¦ *Size:* ${fileSizeMB} MB\n` +
                    `ðŸ”— *URL:* ${result.url}\n\n` +
                    `_Click the link to view/download_`
            }, { quoted: message });
            fs.unlinkSync(tempPath);
        }
        catch (error) {
            console.error('Upload Error:', error);
            await sock.sendMessage(chatId, {
                text: `âŒ Upload failed!\n\nError: ${error.message}`
            }, { quoted: message });
        }
    }
};




