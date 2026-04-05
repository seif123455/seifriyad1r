import axios from 'axios';
export default {
    command: 'سهاريكهات',
    aliases: ['sharechatdl', 'sharechatvideo', 'sharechat'],
    category: 'التحميل',
    description: 'تحميل فيديو فروم سهاريكهات',
    usage: '.سهاريكهات <سهاريكهات رابط>',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const url = args?.[0];
        if (!url) {
            return await sock.sendMessage(chatId, { text: 'Please provide a ShareChat URL.\nExample: .sharechat https://sharechat.com/video/XDPQKxb?referrer=url' }, { quoted: message });
        }
        try {
            const apiUrl = `https://discardapi.dpdns.org/api/dl/sharechat?apikey=guru&url=${encodeURIComponent(url)}`;
            const { data } = await axios.get(apiUrl, { timeout: 10000 });
            if (!data?.status || !data.result?.length) {
                return await sock.sendMessage(chatId, { text: 'âŒ No video found for this URL.' }, { quoted: message });
            }
            const videoUrl = data.result[0].video;
            const imageUrl = data.result[0].image;
            if (imageUrl) {
                await sock.sendMessage(chatId, { image: { url: imageUrl }, caption: 'ðŸ–¼ï¸ ShareChat Thumbnail' }, { quoted: message });
            }
            if (videoUrl) {
                await sock.sendMessage(chatId, { video: { url: videoUrl }, caption: 'ðŸŽ¬ ShareChat Video' }, { quoted: message });
            }
        }
        catch (error) {
            console.error('ShareChat plugin error:', error);
            if (error.code === 'ECONNABORTED') {
                await sock.sendMessage(chatId, { text: 'âŒ Request timed out. The API may be slow or unreachable.' }, { quoted: message });
            }
            else {
                await sock.sendMessage(chatId, { text: 'âŒ Failed to fetch ShareChat video.' }, { quoted: message });
            }
        }
    }
};




