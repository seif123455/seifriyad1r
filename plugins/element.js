import axios from 'axios';
export default {
    command: 'يليمينت',
    aliases: ['atom', 'periodictable', 'element'],
    category: 'البحث',
    description: '',
    usage: '.يليمينت <نامي ور سيمبول>',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const query = args?.join(' ')?.trim();
        if (!query) {
            return await sock.sendMessage(chatId, { text: '*Provide element name or symbol.*\nExample: .element H' }, { quoted: message });
        }
        try {
            const { data: json } = await axios.get(`https://api.popcat.xyz/periodic-table?element=${encodeURIComponent(query)}`);
            if (!json?.name) {
                return await sock.sendMessage(chatId, { text: 'âŒ Element not found.' }, { quoted: message });
            }
            const text = `ðŸ§ª *Element Info*\n` +
                `â€¢ Name: ${json.name}\n` +
                `â€¢ Symbol: ${json.symbol}\n` +
                `â€¢ Atomic #: ${json.atomic_number}\n` +
                `â€¢ Atomic Mass: ${json.atomic_mass}\n` +
                `â€¢ Period: ${json.period}\n` +
                `â€¢ Phase: ${json.phase}\n` +
                `â€¢ Discovered By: ${json.discovered_by || 'Unknown'}\n\n` +
                `ðŸ“˜ Summary:\n${json.summary}`;
            await sock.sendMessage(chatId, { image: { url: json.image }, caption: text }, { quoted: message });
        }
        catch (error) {
            console.error('Element plugin error:', error);
            await sock.sendMessage(chatId, { text: 'âŒ Failed to fetch element info.' }, { quoted: message });
        }
    }
};



