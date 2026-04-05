import axios from 'axios';
export default {
    command: 'بينستالك',
    aliases: ['pstalk', 'pinprofile', 'pinstalk'],
    category: 'stalk',
    description: 'بحث بينتيريست مستخدم صورة شخصية',
    usage: '.بينستالك <مستخدمنامي>',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        if (!args.length) {
            return await sock.sendMessage(chatId, {
                text: '*Please provide a Pinterest username.*\nExample: .pinstalk anti_establishment'
            }, { quoted: message });
        }
        const username = args[0];
        try {
            const { data } = await axios.get(`https://discardapi.dpdns.org/api/stalk/pinterest`, {
                params: { apikey: 'guru', username }
            });
            if (!data?.result) {
                return await sock.sendMessage(chatId, { text: 'âŒ Pinterest user not found.' }, { quoted: message });
            }
            const result = data.result;
            const profileImage = result.image?.large || result.image?.original || null;
            const caption = `ðŸ“Œ *Pinterest Profile Info*\n\n` +
                `ðŸ‘¤ Full Name: ${result.full_name || 'N/A'}\n` +
                `ðŸ†” Username: ${result.username || 'N/A'}\n` +
                `ðŸ“ Bio: ${result.bio || 'N/A'}\n` +
                `ðŸ“Œ Boards: ${result.stats?.boards || 0}\n` +
                `ðŸ‘¥ Followers: ${result.stats?.followers || 0}\n` +
                `âž¡ Following: ${result.stats?.following || 0}\n` +
                `â¤ï¸ Likes: ${result.stats?.likes || 0}\n` +
                `ðŸ“Œ Pins: ${result.stats?.pins || 0}\n` +
                `ðŸ’¾ Saves: ${result.stats?.saves || 0}\n` +
                `ðŸ”— Profile URL: ${result.profile_url || 'N/A'}\n` +
                `ðŸŒ Website: ${result.website || 'N/A'}`;
            if (profileImage) {
                await sock.sendMessage(chatId, { image: { url: profileImage }, caption }, { quoted: message });
            }
            else {
                await sock.sendMessage(chatId, { text: caption }, { quoted: message });
            }
        }
        catch (err) {
            console.error('Pinterest plugin error:', err);
            await sock.sendMessage(chatId, { text: 'âŒ Failed to fetch Pinterest profile.' }, { quoted: message });
        }
    }
};




