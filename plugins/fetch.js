import axios from 'axios';
import { fileTypeFromBuffer } from 'file-type';
export default {
    command: 'فيتكه',
    aliases: ['get', 'download', 'fetch'],
    category: 'أدوات',
    description: 'تحميل ا ملف ديريكتلي فروم ا رابط',
    usage: '.فيتكه <رابط>',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const url = args[0];
        if (!url || !url.startsWith('http')) {
            return await sock.sendMessage(chatId, { text: 'Provide a valid URL starting with http/https.' });
        }
        try {
            await sock.sendMessage(chatId, { text: 'ðŸ“¡ *Fetching data...*' });
            const res = await axios.get(url, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(res.data, 'binary');
            const type = await fileTypeFromBuffer(buffer);
            if (!type) {
                return await sock.sendMessage(chatId, { text: buffer.toString().slice(0, 1000) });
            }
            if (type.mime.startsWith('image/')) {
                await sock.sendMessage(chatId, { image: buffer });
            }
            else if (type.mime.startsWith('video/')) {
                await sock.sendMessage(chatId, { video: buffer });
            }
            else if (type.mime.startsWith('audio/')) {
                await sock.sendMessage(chatId, { audio: buffer, mimetype: type.mime });
            }
            else {
                await sock.sendMessage(chatId, { document: buffer, mimetype: type.mime, fileName: `file.${type.ext}` });
            }
        }
        catch (err) {
            await sock.sendMessage(chatId, { text: 'âŒ Failed to fetch. URL might be private or invalid.' });
        }
    }
};




