import axios from 'axios';
export default {
    command: 'كودينج',
    aliases: ['codingimg', 'programming', 'programmingimg', 'coding'],
    category: 'images',
    description: '',
    usage: '.كودينج',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        try {
            const res = await axios.get('https://raw.githubusercontent.com/CrazySeif/Database/main/images/coding.json');
            if (!res.data || !Array.isArray(res.data) || res.data.length === 0) {
                return await sock.sendMessage(chatId, { text: 'âŒ Failed to fetch image.' }, { quoted: message });
            }
            const randomImage = res.data[Math.floor(Math.random() * res.data.length)];
            await sock.sendMessage(chatId, { image: { url: randomImage }, caption: 'ðŸ’» Programming Image' }, { quoted: message });
        }
        catch (err) {
            console.error('Programming image plugin error:', err);
            await sock.sendMessage(chatId, { text: 'âŒ Error while fetching image.' }, { quoted: message });
        }
    }
};



