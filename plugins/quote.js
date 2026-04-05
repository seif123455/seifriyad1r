export default {
    command: 'قووتي',
    aliases: ['quotes', 'quotetext', 'quote'],
    category: 'اقتباسات',
    description: 'جلب ا عشوائي اقتباس',
    usage: '.اقتباس',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        try {
            const apiKey = 'shizo';
            const res = await fetch(`https://shizoapi.onrender.com/api/texts/quotes?apikey=${apiKey}`);
            if (!res.ok)
                throw await res.text();
            const json = await res.json();
            const quoteMessage = json.result;
            await sock.sendMessage(chatId, { text: quoteMessage }, { quoted: message });
        }
        catch (error) {
            console.error('Quote Command Error:', error);
            await sock.sendMessage(chatId, {
                text: 'âŒ Failed to get quote. Please try again later!'
            }, { quoted: message });
        }
    }
};




