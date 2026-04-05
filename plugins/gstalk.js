import axios from 'axios';
export default {
    command: 'جيتهوب',
    aliases: ['ghprofile', 'gh', 'github'],
    category: 'stalk',
    description: 'بحث جيتهوب مستخدم صورة شخصية',
    usage: '.جيتهوب <مستخدمنامي>',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        if (!args.length) {
            return await sock.sendMessage(chatId, {
                text: '*Please provide a GitHub username.*\nExample: .github CrazySeif'
            }, { quoted: message });
        }
        const username = args[0];
        try {
            const apiUrl = `https://discardapi.onrender.com/api/stalk/github?apikey=guru&url=${username}`;
            const { data } = await axios.get(apiUrl, {
                timeout: 45000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            if (!data?.result) {
                return await sock.sendMessage(chatId, { text: 'âŒ GitHub user not found.' }, { quoted: message });
            }
            const result = data.result;
            const caption = `ðŸ™ *GitHub Profile Info*\n\n` +
                `ðŸ‘¤ Name: ${result.nickname || 'N/A'}\n` +
                `ðŸ†” Username: ${result.username || 'N/A'}\n` +
                `ðŸ¢ Company: ${result.company || 'N/A'}\n` +
                `ðŸ“ Location: ${result.location || 'N/A'}\n` +
                `ðŸ’¬ Bio: ${result.bio || 'N/A'}\n` +
                `ðŸ“¦ Public Repos: ${result.public_repo || 0}\n` +
                `ðŸ“œ Public Gists: ${result.public_gists || 0}\n` +
                `ðŸ‘¥ Followers: ${result.followers || 0}\n` +
                `âž¡ Following: ${result.following || 0}\n` +
                `ðŸ”— Profile URL: ${result.url || 'N/A'}\n` +
                `ðŸ“… Created At: ${new Date(result.created_at).toDateString()}\n` +
                `ðŸ•’ Last Updated: ${new Date(result.updated_at).toDateString()}`;
            await sock.sendMessage(chatId, { image: { url: result.profile_pic }, caption }, { quoted: message });
        }
        catch (err) {
            console.error('GitHub plugin error:', err);
            await sock.sendMessage(chatId, { text: 'âŒ Failed to fetch GitHub profile.' }, { quoted: message });
        }
    }
};




