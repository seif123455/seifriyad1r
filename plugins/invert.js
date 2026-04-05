import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
export default {
    command: 'ينفيرت',
    aliases: ['negative', 'invert'],
    category: 'أدوات',
    description: 'تحويل ان صورة تو نيجاتيفي',
    usage: 'رد تو ان صورة ويته .ينفيرت',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        try {
            const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quoted?.imageMessage) {
                return await sock.sendMessage(chatId, { text: 'ðŸ¤ *Invert Image*\n\nReply to an image to convert it to negative\n\nUsage:\n.invert' }, { quoted: message });
            }
            await sock.sendMessage(chatId, { react: { text: 'ðŸ”„', key: message.key } });
            const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            const tempFile = path.join(process.cwd(), `invert_${Date.now()}.jpg`);
            fs.writeFileSync(tempFile, buffer);
            const form = new FormData();
            form.append('apikey', 'guru');
            form.append('file', fs.createReadStream(tempFile));
            const res = await axios.post('https://discardapi.dpdns.org/api/image/invert', form, { headers: form.getHeaders(), responseType: 'arraybuffer', timeout: 60000 });
            fs.unlinkSync(tempFile);
            if (!res?.data)
                throw new Error('Negative conversion failed');
            const grayFile = path.join(process.cwd(), `invert_result_${Date.now()}.jpg`);
            fs.writeFileSync(grayFile, res.data);
            await sock.sendMessage(chatId, {
                image: { url: grayFile },
                caption: `ðŸ¤ *Inverted Image*\n\nProcessed by: MEGA-MD`
            }, { quoted: message });
            fs.unlinkSync(grayFile);
        }
        catch (err) {
            console.error('Invert Plugin Error:', err);
            await sock.sendMessage(chatId, { text: 'âŒ Failed to convert image to sepia. Make sure the image is clear and try again.' }, { quoted: message });
        }
    }
};




