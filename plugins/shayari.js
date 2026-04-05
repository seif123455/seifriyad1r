export default {
    command: 'سهاياري',
    aliases: ['poetry', 'shayar', 'shayari'],
    category: 'اقتباسات',
    description: 'جلب ا عشوائي سهاياري',
    usage: '.سهاياري',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        try {
            const response = await fetch('https://shizoapi.onrender.com/api/texts/shayari?apikey=shizo');
            const data = await response.json();
            if (!data || !data.result) {
                throw new Error('Invalid response from API');
            }
            const buttons = [
                { buttonId: '.سهاياري', buttonText: { displayText: 'Shayari ðŸª„' }, type: 1 },
                { buttonId: '.roseday', buttonText: { displayText: 'ðŸŒ¹ RoseDay' }, type: 1 }
            ];
            await sock.sendMessage(chatId, {
                text: data.result,
                buttons,
                headerType: 1
            }, { quoted: message });
        }
        catch (error) {
            console.error('Shayari Command Error:', error);
            await sock.sendMessage(chatId, {
                text: 'âŒ Failed to fetch shayari. Please try again later.',
            }, { quoted: message });
        }
    }
};



