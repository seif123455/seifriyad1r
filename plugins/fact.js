import axios from 'axios';
export default { command: 'Ø­Ù‚ÙŠÙ‚Ø©', aliases: ['randomfact', 'uselessfact', 'fact'], category: 'ØªØ³Ù„ÙŠØ©', description: 'Ø§Ø­ØµÙ„ Ø§ Ø¹Ø´ÙˆØ§Ø¦ÙŠ ÙŠÙ†ØªÙŠØ±ÙŠØ³ØªÙŠÙ†Ø¬ ÙØ§ÙƒØª', Ø§Ø³ØªØ®Ø¯Ø§Ù…: '.ÙØ§ÙƒØª', async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        try {
            const r = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en');
            await sock.sendMessage(chatId, { text: r.data.text }, { quoted: message });
        }
        catch (e) {
            console.error('Error fetching fact:', e);
            await sock.sendMessage(chatId, { text: 'Sorry, I could not fetch a fact right now.' }, { quoted: message });
        }
    } };


