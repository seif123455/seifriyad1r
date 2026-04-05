import axios from 'axios';
const OMDB_KEY = 'trilogy';
export default {
    command: 'موفيي',
    aliases: ['film', 'bollywood', 'omdb', 'imdb', 'movie'],
    category: 'معلومات',
    description: 'بحث موفيي معلومات, راتينجس, كاست, بلوت',
    usage: '.موفيي <موفيي نامي>\ن.موفيي باتهاان\ن.موفيي جاوان 2023',
    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        const input = args.join(' ').trim();
        if (!input) {
            return await sock.sendMessage(chatId, {
                text: `ðŸŽ¬ *Movie Info*\n\n` +
                    `*Usage:* \`.movie <name>\`\n\n` +
                    `*Examples:*\n` +
                    `â€¢ \`.movie Pathaan\`\n` +
                    `â€¢ \`.movie Jawan 2023\`\n` +
                    `â€¢ \`.movie Avengers Endgame\`\n` +
                    `â€¢ \`.movie RRR\`\n` +
                    `â€¢ \`.movie Black Panther\`\n\n` +
                    `Works for Bollywood, Hollywood, and all languages!`,
                ...channelInfo
            }, { quoted: message });
        }
        await sock.sendMessage(chatId, { text: `ðŸ” Searching *${input}*...`, ...channelInfo }, { quoted: message });
        try {
            // Try exact title first, then search
            const year = input.match(/\b(19|20)\d{2}\b/)?.[0];
            const title = input.replace(/\b(19|20)\d{2}\b/, '').trim();
            let url = `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${OMDB_KEY}&plot=full`;
            if (year)
                url += `&y=${year}`;
            const res = await axios.get(url, { timeout: 15000 });
            let data = res.data;
            // If not found, try search
            if (data.Response === 'False') {
                const searchRes = await axios.get(`https://www.omdbapi.com/?s=${encodeURIComponent(title)}&apikey=${OMDB_KEY}&type=movie`, { timeout: 15000 });
                const searchData = searchRes.data;
                if (searchData.Response === 'True' && searchData.Search?.length) {
                    const first = searchData.Search[0];
                    const detailRes = await axios.get(`https://www.omdbapi.com/?i=${first.imdbID}&apikey=${OMDB_KEY}&plot=full`, { timeout: 15000 });
                    data = detailRes.data;
                }
            }
            if (data.Response === 'False') {
                return await sock.sendMessage(chatId, {
                    text: `âŒ Movie not found: *${input}*`,
                    ...channelInfo
                }, { quoted: message });
            }
            const ratings = (data.Ratings || []).map((r) => `â€¢ ${r.Source}: *${r.Value}*`).join('\n');
            const imdbStars = data.imdbRating !== 'N/A'
                ? `${'â­'.repeat(Math.round(parseFloat(data.imdbRating) / 2)) } (${data.imdbRating}/10)`
                : 'N/A';
            const text = `ðŸŽ¬ *${data.Title}* (${data.Year})\n\n` +
                `ðŸŽ­ *Genre:* ${data.Genre}\n` +
                `ðŸŒ *Language:* ${data.Language}\n` +
                `ðŸŽ¬ *Director:* ${data.Director}\n` +
                `ðŸŽ­ *Cast:* ${data.Actors}\n` +
                `â±ï¸ *Runtime:* ${data.Runtime}\n` +
                `ðŸ† *Awards:* ${data.Awards}\n\n` +
                `${imdbStars}\n` +
                `${ratings}\n\n` +
                `ðŸ“ *Plot:*\n${data.Plot}\n\n${ 
                data.BoxOffice && data.BoxOffice !== 'N/A' ? `ðŸ’° *Box Office:* ${data.BoxOffice}\n` : '' 
                }ðŸ”— imdb.com/title/${data.imdbID}`;
            await sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });
        }
        catch (error) {
            await sock.sendMessage(chatId, {
                text: `âŒ Failed: ${error.message}`,
                ...channelInfo
            }, { quoted: message });
        }
    }
};



