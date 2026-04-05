import axios from 'axios';
export default {
    command: 'تويتتير',
    aliases: ['xtweet', 'tweetdl', 'twitterdl', 'twitter'],
    category: 'التحميل',
    description: 'تحميل وسائط (فيديو ور صورة) فروم كس/تويتتير بوست',
    usage: '.تويتتير <توييت رابط>',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const url = args?.[0];
        if (!url) {
            return await sock.sendMessage(chatId, { text: 'Please provide a Twitter/X URL.\nExample: .twitter https://x.com/i/status/2002054360428167305' }, { quoted: message });
        }
        try {
            const apiUrl = `https://discardapi.dpdns.org/api/dl/twitter?apikey=guru&url=${encodeURIComponent(url)}`;
            const { data } = await axios.get(apiUrl, { timeout: 10000 });
            if (!data?.status || !data.result?.media?.length) {
                return await sock.sendMessage(chatId, { text: 'âŒ No media found for this Tweet.' }, { quoted: message });
            }
            const tweet = data.result;
            const caption = `
ðŸ“ @${tweet.authorUsername} (${tweet.authorName})
ðŸ“… ${tweet.date}
â¤ï¸ Likes: ${tweet.likes} | ðŸ” Retweets: ${tweet.retweets} | ðŸ’¬ Replies: ${tweet.replies}

ðŸ’¬ ${tweet.text}
      `.trim();
            for (const mediaItem of tweet.media) {
                if (mediaItem.type === 'video') {
                    await sock.sendMessage(chatId, { video: { url: mediaItem.url }, caption }, { quoted: message });
                }
                else if (mediaItem.type === 'image') {
                    await sock.sendMessage(chatId, { image: { url: mediaItem.url }, caption }, { quoted: message });
                }
            }
        }
        catch (error) {
            console.error('Twitter plugin error:', error);
            if (error.code === 'ECONNABORTED') {
                await sock.sendMessage(chatId, { text: 'âŒ Request timed out. The API may be slow or unreachable.' }, { quoted: message });
            }
            else {
                await sock.sendMessage(chatId, { text: 'âŒ Failed to fetch Twitter/X media.' }, { quoted: message });
            }
        }
    }
};




