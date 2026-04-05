export default {
    command: 'تينيورل',
    aliases: ['shorten', 'tiny', 'tinyurl'],
    category: 'أدوات',
    description: 'سهورتين ا رابط وسينج تينيرابط',
    usage: '.تينيرابط <رابط>',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const query = args?.join(' ')?.trim();
        if (!query) {
            return await sock.sendMessage(chatId, { text: '*Please provide a URL to shorten.*\nExample: .tinyurl https://example.com' }, { quoted: message });
        }
        try {
            const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(query)}`);
            const shortUrl = await response.text();
            if (!shortUrl) {
                return await sock.sendMessage(chatId, { text: 'âŒ Error: Could not generate a short URL.' }, { quoted: message });
            }
            const output = `âœ¨ *YOUR SHORT URL*\n\n` +
                `ðŸ”— *Original Link:*\n${query}\n\n` +
                `âœ‚ï¸ *Shortened URL:*\n${shortUrl}`;
            await sock.sendMessage(chatId, { text: output }, { quoted: message });
        }
        catch (err) {
            console.error('TinyURL plugin error:', err);
            await sock.sendMessage(chatId, { text: 'âŒ Failed to shorten URL.' }, { quoted: message });
        }
    }
};




