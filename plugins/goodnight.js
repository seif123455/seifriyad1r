export default {
    command: 'جوودنيجهت',
    aliases: ['gn', 'night', 'goodnight'],
    category: 'اقتباسات',
    description: 'إرسال ا عشوائي جوود ليل رسالة',
    usage: '.جوودنيجهت',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        try {
            const shizokeys = 'shizo';
            const res = await fetch(`https://shizoapi.onrender.com/api/texts/lovenight?apikey=${shizokeys}`);
            if (!res.ok) {
                throw new Error(await res.text());
            }
            const json = await res.json();
            const goodnightMessage = json.result;
            await sock.sendMessage(chatId, { text: goodnightMessage }, { quoted: message });
        }
        catch (error) {
            console.error('Goodnight plugin error:', error);
            await sock.sendMessage(chatId, { text: 'âŒ Failed to get goodnight message. Please try again later!' }, { quoted: message });
        }
    }
};



