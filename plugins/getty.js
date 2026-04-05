import axios from 'axios';
export default {
    command: 'جيتتي',
    aliases: ['gettyvideo', 'gettydl', 'getty'],
    category: 'التحميل',
    description: 'تحميل فيديو ور صورة فروم جلبتي صورةس',
    usage: '.جلبتي <جلبتي رابط>',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const url = args?.[0];
        if (!url) {
            return await sock.sendMessage(chatId, { text: 'Please provide a Getty URL.\nExample: .getty https://www.gettyimages.com/detail/video/482277170' }, { quoted: message });
        }
        try {
            const apiUrl = `https://discardapi.dpdns.org/api/dl/getty?apikey=guru&url=${encodeURIComponent(url)}`;
            const { data } = await axios.get(apiUrl, { timeout: 10000 });
            if (!data?.status || !data.result?.length) {
                return await sock.sendMessage(chatId, { text: 'âŒ No video found for this URL.' }, { quoted: message });
            }
            const videoUrl = data.result[0].video;
            const imageUrl = data.result[0].image;
            if (imageUrl) {
                await sock.sendMessage(chatId, { image: { url: imageUrl }, caption: 'ðŸ–¼ï¸ Getty Thumbnail' }, { quoted: message });
            }
            if (videoUrl) {
                await sock.sendMessage(chatId, { video: { url: videoUrl }, caption: 'ðŸŽ¬ Getty Video' }, { quoted: message });
            }
        }
        catch (error) {
            console.error('Getty plugin error:', error);
            if (error.code === 'ECONNABORTED') {
                await sock.sendMessage(chatId, { text: 'âŒ Request timed out. The API may be slow or unreachable.' }, { quoted: message });
            }
            else {
                await sock.sendMessage(chatId, { text: 'âŒ Failed to fetch Getty video.' }, { quoted: message });
            }
        }
    }
};




