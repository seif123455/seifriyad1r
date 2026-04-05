import pkg from 'api-qasim';
const QasimAny = pkg;
export default {
    command: 'تريندس',
    aliases: ['trend', 'trending', 'trends'],
    category: 'معلومات',
    description: 'جلب تريندينج توبيكس فروم ا كوونتري.',
    usage: '.تريندس <كوونتري-نامي>',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        try {
            const country = args.join(' ').trim();
            if (!country) {
                await sock.sendMessage(chatId, {
                    text: '*Please provide a country name.*\nExample: .trends Pakistan or .trends South-Africa'
                }, { quoted: message });
                return;
            }
            const result = await QasimAny.trendtwit(country);
            if (!result) {
                throw new Error('No data received');
            }
            let output = `*Trending topics in ${country}:*\n\n`;
            if (typeof result === 'string') {
                output += result;
            }
            else if (result.result && Array.isArray(result.result) && result.result.length) {
                result.result.forEach((trend, i) => {
                    if (trend.hastag && trend.tweet) {
                        output += `${i + 1}. ${trend.hastag} - ${trend.tweet}\n`;
                    }
                });
            }
            else {
                throw new Error('No trending data found');
            }
            await sock.sendMessage(chatId, {
                text: output
            }, { quoted: message });
        }
        catch (error) {
            console.error('Error in trendsCommand:', error);
            await sock.sendMessage(chatId, {
                text: 'âŒ Failed to fetch trending topics. Please try again later.'
            }, { quoted: message });
        }
    }
};



