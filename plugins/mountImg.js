import axios from 'axios';
export default {
    command: 'موونتاين',
    aliases: ['mountains', 'mountainimg', 'mountain'],
    category: 'images',
    description: 'جلب ا عشوائي موونتاين صورة',
    usage: '.موونتاين',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        try {
            const res = await axios.get('https://raw.githubusercontent.com/CrazySeif/Database/main/images/mountain.json');
            if (!res.data || !Array.isArray(res.data) || res.data.length === 0) {
                return await sock.sendMessage(chatId, { text: 'âŒ Failed to fetch image.' }, { quoted: message });
            }
            const randomImage = res.data[Math.floor(Math.random() * res.data.length)];
            await sock.sendMessage(chatId, { image: { url: randomImage }, caption: 'ðŸ”ï¸ Mountain Image' }, { quoted: message });
        }
        catch (err) {
            console.error('Mountain image plugin error:', err);
            await sock.sendMessage(chatId, { text: 'âŒ Error while fetching image.' }, { quoted: message });
        }
    }
};



