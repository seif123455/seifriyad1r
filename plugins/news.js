import axios from 'axios';
export default {
    command: 'أخبار',
    aliases: ['headlines', 'latestnews', 'news'],
    category: 'معلومات',
    description: 'جلب تهي لااختبار أعلى 5 أخبار هيادلينيس فروم تهي وس',
    usage: '.أخبار',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        try {
            const apiKey = 'dcd720a6f1914e2d9dba9790c188c08c';
            const response = await axios.get(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`);
            if (!response.data || !response.data.articles)
                throw new Error('Invalid API response');
            const articles = response.data.articles.slice(0, 5);
            if (articles.length === 0) {
                await sock.sendMessage(chatId, {
                    text: 'âŒ No news found at the moment. Please try again later.',
                    quoted: message
                });
                return;
            }
            let newsMessage = 'ðŸ“° *Latest News*:\n\n';
            articles.forEach((article, index) => {
                newsMessage += `${index + 1}. *${article.title}*\n${article.description || 'No description'}\n\n`;
            });
            await sock.sendMessage(chatId, {
                text: newsMessage.trim(),
                quoted: message
            });
        }
        catch (error) {
            console.error('News Command Error:', error);
            await sock.sendMessage(chatId, {
                text: 'âŒ Sorry, I could not fetch news right now. Please try again later.',
                quoted: message
            });
        }
    }
};




