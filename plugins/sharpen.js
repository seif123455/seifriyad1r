import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
export default {
    command: 'سهاربين',
    aliases: ['enhance', 'sharpen'],
    category: 'أدوات',
    description: 'تحويل ان صورة تو سهاربين',
    usage: 'رد تو ان صورة ويته .سهاربين',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        try {
            const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quoted?.imageMessage) {
                return await sock.sendMessage(chatId, { text: 'ðŸ©µ *Sharpen Image*\n\nReply to an image to convert it to sepia\n\nUsage:\n.sharpen' }, { quoted: message });
            }
            await sock.sendMessage(chatId, { react: { text: 'ðŸ”„', key: message.key } });
            const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            const tempFile = path.join(process.cwd(), `sepia_${Date.now()}.jpg`);
            fs.writeFileSync(tempFile, buffer);
            const form = new FormData();
            form.append('apikey', 'guru');
            form.append('file', fs.createReadStream(tempFile));
            const res = await axios.post('https://discardapi.dpdns.org/api/image/sharpen', form, { headers: form.getHeaders(), responseType: 'arraybuffer', timeout: 60000 });
            fs.unlinkSync(tempFile);
            if (!res?.data)
                throw new Error('Sharpen conversion failed');
            const grayFile = path.join(process.cwd(), `sepia_result_${Date.now()}.jpg`);
            fs.writeFileSync(grayFile, res.data);
            await sock.sendMessage(chatId, {
                image: { url: grayFile },
                caption: `ðŸ©µ *Sharpen Image*\n\nð™¿ðš›ðš˜ðšŒðšŽðšœðšœðšŽðš ðš‹ðš¢: ð™¼ð™´ð™¶ð™°-ð™¼ð™³`
            }, { quoted: message });
            fs.unlinkSync(grayFile);
        }
        catch (err) {
            console.error('Sharpen Plugin Error:', err);
            await sock.sendMessage(chatId, { text: 'âŒ Failed to convert image to sepia. Make sure the image is clear and try again.' }, { quoted: message });
        }
    }
};




