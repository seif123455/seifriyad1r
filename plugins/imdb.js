export default {
    command: 'يمدب',
    aliases: ['movie', 'film', 'imdb'],
    category: 'معلومات',
    description: 'جلب ديتايليد معلوماترماتيون ابووت ا موفيي ور سيرييس فروم يمدب',
    usage: '.يمدب <موفيي/سيرييس تيتلي>',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const text = args.join(' ').trim();
        if (!text) {
            await sock.sendMessage(chatId, {
                text: '*Please provide a movie or series title.*\nExample: `.imdb Inception`',
                quoted: message
            });
            return;
        }
        try {
            const res = await fetch(`https://api.popcat.xyz/imdb?q=${encodeURIComponent(text)}`);
            if (!res.ok)
                throw new Error(`API request failed with status ${res.status}`);
            const json = await res.json();
            const ratings = (json.ratings || [])
                .map((r) => `â­ *${r.source}:* ${r.value}`)
                .join('\n') || 'No ratings available';
            const movieInfo = `
ðŸŽ¬ *${json.title || 'N/A'}* (${json.year || 'N/A'})
ðŸŽ­ *Genres:* ${json.genres || 'N/A'}
ðŸ“º *Type:* ${json.type || 'N/A'}
ðŸ“ *Plot:* ${json.plot || 'N/A'}
â­ *IMDB Rating:* ${json.rating || 'N/A'} (${json.votes || 'N/A'} votes)
ðŸ† *Awards:* ${json.awards || 'N/A'}
ðŸŽ¬ *Director:* ${json.director || 'N/A'}
âœï¸ *Writer:* ${json.writer || 'N/A'}
ðŸ‘¨â€ðŸ‘©â€ðŸ‘§â€ðŸ‘¦ *Actors:* ${json.actors || 'N/A'}
â±ï¸ *Runtime:* ${json.runtime || 'N/A'}
ðŸ“… *Released:* ${json.released || 'N/A'}
ðŸŒ *Country:* ${json.country || 'N/A'}
ðŸ—£ï¸ *Languages:* ${json.languages || 'N/A'}
ðŸ’° *Box Office:* ${json.boxoffice || 'N/A'}
ðŸ’½ *DVD Release:* ${json.dvd || 'N/A'}
ðŸ¢ *Production:* ${json.production || 'N/A'}
ðŸ”— *Website:* ${json.website || 'N/A'}

*Ratings:*
${ratings}
      `.trim();
            if (json.poster) {
                await sock.sendMessage(chatId, {
                    image: { url: json.poster },
                    caption: movieInfo,
                    quoted: message
                });
            }
            else {
                await sock.sendMessage(chatId, { text: movieInfo, quoted: message });
            }
        }
        catch (error) {
            console.error('IMDB Command Error:', error);
            await sock.sendMessage(chatId, {
                text: 'âŒ Failed to fetch movie information. Please try again later.',
                quoted: message
            });
        }
    }
};



