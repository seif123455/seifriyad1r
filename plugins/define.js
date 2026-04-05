import axios from 'axios';
export default {
    command: 'تعريف',
    aliases: ['dict', 'urban', 'define'],
    category: 'البحث',
    description: '',
    usage: '.ديفيني <وورد>',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const query = args?.join(' ')?.trim();
        if (!query) {
            return await sock.sendMessage(chatId, { text: '*Please provide a word to search for.*\nExample: .define hello' }, { quoted: message });
        }
        try {
            const url = `https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(query)}`;
            const { data: json } = await axios.get(url);
            if (!json?.list || json.list.length === 0) {
                return await sock.sendMessage(chatId, { text: 'âŒ Word not found in the dictionary.' }, { quoted: message });
            }
            const firstEntry = json.list[0];
            const definition = firstEntry.definition || 'No definition available';
            const example = firstEntry.example ? `*Example:* ${firstEntry.example}` : '';
            const text = `ðŸ” *Dictionary*\n\n*Word:* ${query}\n*Definition:* ${definition}\n${example}`;
            await sock.sendMessage(chatId, { text }, { quoted: message });
        }
        catch (error) {
            console.error('Urban plugin error:', error);
            await sock.sendMessage(chatId, { text: 'âŒ Failed to fetch definition.', }, { quoted: message });
        }
    }
};



