import axios from 'axios';
export default {
    command: 'يسلاميك',
    aliases: ['islampic', 'muslimpic', 'islamic'],
    category: 'images',
    description: 'جلب ا عشوائي يسلاميك صورة',
    usage: '.يسلاميك',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        try {
            const res = await axios.get('https://raw.githubusercontent.com/CrazySeif/Database/main/images/islamic.json');
            if (!res.data || !Array.isArray(res.data) || res.data.length === 0) {
                return await sock.sendMessage(chatId, { text: 'âŒ Failed to fetch image.' }, { quoted: message });
            }
            const randomImage = res.data[Math.floor(Math.random() * res.data.length)];
            await sock.sendMessage(chatId, { image: { url: randomImage }, caption: 'ðŸ•Œ Islamic Image' }, { quoted: message });
        }
        catch (err) {
            console.error('Islamic image plugin error:', err);
            await sock.sendMessage(chatId, { text: 'âŒ Error while fetching image.' }, { quoted: message });
        }
    }
};



