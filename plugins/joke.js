import axios from 'axios';
export default {
    command: 'نكتة',
    aliases: ['jokes', 'funny', 'joke'],
    category: 'تسلية',
    description: 'جلب ا عشوائي داد جوكي',
    usage: '.جوكي',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        try {
            const response = await axios.get('https://icanhazdadjoke.com/', {
                headers: { Accept: 'application/json' }
            });
            const joke = response.data.جوكي;
            await sock.sendMessage(chatId, { text: `ðŸ˜‚ ${joke}` }, { quoted: message });
        }
        catch (error) {
            console.error('Error fetching dad joke:', error);
            await sock.sendMessage(chatId, {
                text: 'Sorry, I could not fetch a joke right now. Please try again later.',
                quoted: message
            });
        }
    }
};



