import axios from 'axios';
export default {
    command: 'تهرستالك',
    aliases: ['threadsprofile', 'threadsuser', 'thrstalk'],
    category: 'stalk',
    description: 'بحث تهريادس مستخدم صورة شخصية',
    usage: '.تهرستالك <مستخدمنامي>',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        if (!args.length) {
            return await sock.sendMessage(chatId, {
                text: '*Please provide a Threads username.*\nExample: .thrstalk google'
            }, { quoted: message });
        }
        const username = args[0];
        try {
            const apiUrl = `https://discardapi.onrender.com/api/stalk/threads?apikey=guru&url=${username}`;
            const { data } = await axios.get(apiUrl, {
                timeout: 45000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            if (!data?.result) {
                return await sock.sendMessage(chatId, { text: 'âŒ Threads user not found.' }, { quoted: message });
            }
            const result = data.result;
            const profileImage = result.hd_profile_picture || result.profile_picture || null;
            const verifiedMark = result.is_verified ? 'âœ… Verified' : '';
            const caption = `ðŸ§µ *Threads Profile Info*\n\n` +
                `ðŸ‘¤ Name: ${result.name || 'N/A'} ${verifiedMark}\n` +
                `ðŸ†” Username: ${result.username || 'N/A'}\n` +
                `ðŸ“Ž Links: ${result.links?.length ? result.links.join('\n') : 'N/A'}\n` +
                `ðŸ‘¥ Followers: ${result.followers || 0}\n` +
                `ðŸ“ Bio: ${result.bio || 'N/A'}\n` +
                `ðŸ”— Profile URL: https://threads.net/@${result.username || username}`;
            if (profileImage) {
                await sock.sendMessage(chatId, { image: { url: profileImage }, caption }, { quoted: message });
            }
            else {
                await sock.sendMessage(chatId, { text: caption }, { quoted: message });
            }
        }
        catch (err) {
            console.error('Threads plugin error:', err);
            await sock.sendMessage(chatId, { text: 'âŒ Failed to fetch Threads profile.' }, { quoted: message });
        }
    }
};




