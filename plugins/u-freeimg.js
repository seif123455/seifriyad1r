import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import fs from 'fs';
import path from 'path';
import { uploadToFreeimage } from '../lib/uploaders.js';
export default {
    command: 'فريييماجي',
    aliases: ['fimg', 'freeimg', 'freeimage'],
    category: 'upload',
    description: 'رفع تو فرييصورة.هوست',
    usage: '.فرييصورة (رد تو صورة)',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        try {
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quotedMsg?.imageMessage) {
                await sock.sendMessage(chatId, { text: 'âš ï¸ Please reply to an image!' }, { quoted: message });
                return;
            }
            await sock.sendMessage(chatId, { text: 'Uploading to Freeimage...' }, { quoted: message });
            const stream = await downloadContentFromMessage(quotedMsg.imageMessage, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            const tempDir = path.join('./temp');
            if (!fs.existsSync(tempDir))
                fs.mkdirSync(tempDir, { recursive: true });
            const tempPath = path.join(tempDir, `freeimage_${Date.now()}.jpg`);
            fs.writeFileSync(tempPath, buffer);
            const result = await uploadToFreeimage(tempPath);
            await sock.sendMessage(chatId, {
                text: `âœ… *Freeimage Upload Success!*\n\n` +
                    `ðŸ”— *URL:* ${result.url}\n` +
                    `ðŸ–¼ï¸ *Display:* ${result.display_url}\n` +
                    `ðŸ—‘ï¸ *Delete:* ${result.delete_url}`
            }, { quoted: message });
            fs.unlinkSync(tempPath);
        }
        catch (error) {
            console.error('Freeimage Error:', error);
            await sock.sendMessage(chatId, { text: `âŒ Error: ${error.message}` }, { quoted: message });
        }
    }
};




