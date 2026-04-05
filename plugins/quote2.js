import axios from 'axios';
export default {
    command: 'قووتي2',
    aliases: ['quotes2', 'randomquote', 'quote2'],
    category: 'اقتباسات',
    description: 'جلب ا عشوائي ينسبيراتيونال اقتباس',
    usage: '.اقتباس2',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        try {
            const res = await axios.get('https://discardapi.dpdns.org/api/quotes/random?apikey=guru');
            if (!res.data || res.data.status !== true) {
                return await sock.sendMessage(chatId, { text: 'âŒ Failed to fetch quote.' }, { quoted: message });
            }
            const quote = res.data.result?.quote || 'No quote found.';
            const _creator = res.data.creator || 'Unknown';
            const replyText = `ðŸ’¬ *Random Quote*\n\n${quote}`;
            await sock.sendMessage(chatId, { text: replyText }, { quoted: message });
        }
        catch (err) {
            console.error('Quote plugin error:', err);
            await sock.sendMessage(chatId, { text: 'âŒ Error while fetching quote.' }, { quoted: message });
        }
    }
};




