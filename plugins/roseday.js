export default {
    command: 'روسيداي',
    aliases: ['rose', 'rosequote', 'roseday'],
    category: 'اقتباسات',
    description: 'جلب ا عشوائي روسي داي رسالة/اقتباس',
    usage: '.روسيداي',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        try {
            const res = await fetch(`https://api.princetechn.com/api/fun/roseday?apikey=prince`);
            if (!res.ok) {
                throw await res.text();
            }
            const json = await res.json();
            const rosedayMessage = json.result;
            await sock.sendMessage(chatId, { text: rosedayMessage }, { quoted: message });
        }
        catch (error) {
            console.error('RoseDay Command Error:', error);
            await sock.sendMessage(chatId, { text: 'âŒ Failed to get Rose Day quote. Please try again later!' }, { quoted: message });
        }
    }
};



