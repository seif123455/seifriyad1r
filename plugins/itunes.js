export default {
    command: 'يتونيس',
    aliases: ['song', 'music', 'track', 'itunes'],
    category: 'معلومات',
    description: 'جلب ديتايليد معلوماترماتيون ابووت ا أغنية فروم يتونيس',
    usage: '.يتونيس <أغنية نامي>',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const text = args.join(' ').trim();
        if (!text) {
            await sock.sendMessage(chatId, {
                text: '*Please provide a song name.*\nExample: `.itunes Blinding Lights`',
                quoted: message
            });
            return;
        }
        try {
            const url = `https://api.popcat.xyz/itunes?q=${encodeURIComponent(text)}`;
            const res = await fetch(url);
            if (!res.ok)
                throw new Error(`API request failed with status ${res.status}`);
            const json = await res.json();
            const songInfo = `
ðŸŽµ *${json.name || 'N/A'}*
ðŸ‘¤ *Artist:* ${json.artist || 'N/A'}
ðŸ’¿ *Album:* ${json.album || 'N/A'}
ðŸ“… *Release Date:* ${json.release_date || 'N/A'}
ðŸ’° *Price:* ${json.price || 'N/A'}
â±ï¸ *Length:* ${json.length || 'N/A'}
ðŸŽ¼ *Genre:* ${json.genre || 'N/A'}
ðŸ”— *URL:* ${json.url || 'N/A'}
      `.trim();
            if (json.thumbnail) {
                await sock.sendMessage(chatId, {
                    image: { url: json.thumbnail },
                    caption: songInfo,
                    quoted: message
                });
            }
            else {
                await sock.sendMessage(chatId, { text: songInfo, quoted: message });
            }
        }
        catch (error) {
            console.error('iTunes Command Error:', error);
            await sock.sendMessage(chatId, {
                text: 'âŒ An error occurred while fetching the song info. Please try again later.',
                quoted: message
            });
        }
    }
};




