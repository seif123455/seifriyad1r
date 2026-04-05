import axios from 'axios';
export default {
    command: 'نكتة2',
    aliases: ['funny2', 'jokes2', 'joke2'],
    category: 'تسلية',
    description: 'جلب ا عشوائي جينيرال جوكي',
    usage: '.جوكي2',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        try {
            const res = await axios.get('https://raw.githubusercontent.com/CrazySeif/Database/main/text/random_jokes.txt');
            if (!res.data) {
                return await sock.sendMessage(chatId, { text: 'âŒ Failed to fetch joke.' }, { quoted: message });
            }
            const jokes = res.data.split('\n').filter((line) => line.trim() !== '');
            if (jokes.length === 0) {
                return await sock.sendMessage(chatId, { text: 'âŒ No jokes available.' }, { quoted: message });
            }
            const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
            await sock.sendMessage(chatId, { text: `ðŸ˜‚ *Joke*\n\n${randomJoke}` }, { quoted: message });
        }
        catch (err) {
            console.error('Joke plugin error:', err);
            await sock.sendMessage(chatId, { text: 'âŒ Error while fetching joke.' }, { quoted: message });
        }
    }
};



