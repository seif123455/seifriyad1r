import axios from 'axios';
export default {
    command: 'سترينج',
    aliases: ['textinfo', 'textstats', 'string'],
    category: 'معلومات',
    description: 'جلب ديتايليد معلومات ابووت ا نص سترينج',
    usage: '.سترينج <نص>',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const textInput = args?.join(' ')?.trim();
        if (!textInput) {
            return await sock.sendMessage(chatId, { text: '*Provide some text to analyze.*\nExample: .string What is AI' }, { quoted: message });
        }
        try {
            const apiUrl = `https://discardapi.dpdns.org/api/tools/string?apikey=guru&text=${encodeURIComponent(textInput)}`;
            const { data } = await axios.get(apiUrl, { timeout: 10000 });
            if (!data?.status) {
                return await sock.sendMessage(chatId, { text: 'âŒ Failed to analyze text.' }, { quoted: message });
            }
            const reply = `ðŸ“ *Text Analysis*\n\n` +
                `âœï¸ Text: ${textInput}\n` +
                `ðŸ”  Letters: ${data.letters}\n` +
                `ðŸ”¢ Characters (including spaces): ${data.length}\n` +
                `ðŸ“„ Words: ${data.words}\n\n` +
                `ðŸ’¡ Tip: Keep your text concise for better readability!`;
            await sock.sendMessage(chatId, { text: reply }, { quoted: message });
        }
        catch (error) {
            console.error('String plugin error:', error);
            if (error.code === 'ECONNABORTED') {
                await sock.sendMessage(chatId, { text: 'âŒ Request timed out. Please try again later.' }, { quoted: message });
            }
            else {
                await sock.sendMessage(chatId, { text: 'âŒ Failed to fetch text information.' }, { quoted: message });
            }
        }
    }
};




