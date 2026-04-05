import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
export default {
    command: 'ريادقر',
    aliases: ['qrread', 'decodeqr', 'readqr'],
    category: 'أدوات',
    description: 'رياد رمز قر فروم ان صورة',
    usage: 'رد تو ان صورة ويته .ريادقر',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        try {
            const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quoted?.imageMessage) {
                return await sock.sendMessage(chatId, { text: 'ðŸ§¾ *QR Reader*\n\nðŸ“Œ Reply to an image that contains a QR code\n\nUsage:\n.readqr' }, { quoted: message });
            }
            await sock.sendMessage(chatId, {
                react: { text: 'ðŸ”', key: message.key }
            });
            const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            const tempFile = path.join(process.cwd(), `qr_${Date.now()}.png`);
            fs.writeFileSync(tempFile, buffer);
            const form = new FormData();
            form.append('apikey', 'guru');
            form.append('image', fs.createReadStream(tempFile));
            const res = await axios.post('https://discardapi.dpdns.org/api/tools/readqr', form, { headers: form.getHeaders(), timeout: 60000 });
            fs.unlinkSync(tempFile);
            if (!res?.data?.status)
                throw new Error('Decode failed');
            await sock.sendMessage(chatId, {
                text: `âœ… *QR Code Decoded*

ðŸ“„ *Result:*
\`\`\`
${res.data.result}
\`\`\`

ðŸ‘¤ ${res.data.creator}
`
            }, { quoted: message });
        }
        catch (err) {
            console.error('QR Reader Error:', err);
            await sock.sendMessage(chatId, { text: 'âŒ Failed to read QR code. Please try a clearer image.' }, { quoted: message });
        }
    }
};




