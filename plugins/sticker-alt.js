import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
export default {
    command: 'ملصق',
    aliases: ['stik', 's', 'sticker'],
    category: 'ملصقات',
    description: 'تحويل ان صورة ور فيديو ينتو ا ملصق',
    usage: '.ملصق (رد تو صورة/فيديو)',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        try {
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quotedMsg) {
                await sock.sendMessage(chatId, { text: 'âš ï¸ Please reply to an image or video!' }, { quoted: message });
                return;
            }
            const type = Object.keys(quotedMsg)[0];
            if (!['imageMessage', 'videoMessage'].includes(type)) {
                await sock.sendMessage(chatId, { text: 'âš ï¸ Please reply to an image or video!' }, { quoted: message });
                return;
            }
            const stream = await downloadContentFromMessage(quotedMsg[type], type.split('Message')[0]);
            let buffer = Buffer.from([]);
            for await (const chunk of stream)
                buffer = Buffer.concat([buffer, chunk]);
            const tempDir = path.join('./temp');
            if (!fs.existsSync(tempDir))
                fs.mkdirSync(tempDir, { recursive: true });
            const tempInput = path.join(tempDir, `temp_${Date.now()}.${type === 'imageMessage' ? 'jpg' : 'mp4'}`);
            const tempOutput = path.join(tempDir, `sticker_${Date.now()}.webp`);
            fs.writeFileSync(tempInput, buffer);
            await new Promise((resolve, reject) => {
                const cmd = type === 'imageMessage'
                    ? `ffmpeg -i "${tempInput}" -vf "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease" "${tempOutput}"`
                    : `ffmpeg -i "${tempInput}" -vf "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease" -c:v libwebp -preset default -loop 0 -vsync 0 -t 6 "${tempOutput}"`;
                exec(cmd, (error) => {
                    if (error)
                        reject(error);
                    else
                        resolve(undefined);
                });
            });
            await sock.sendMessage(chatId, { sticker: fs.readFileSync(tempOutput) }, { quoted: message });
            fs.unlinkSync(tempInput);
            fs.unlinkSync(tempOutput);
        }
        catch (error) {
            console.error('Sticker Command Error:', error);
            await sock.sendMessage(chatId, { text: 'âŒ Failed to create sticker!' }, { quoted: message });
        }
    }
};




