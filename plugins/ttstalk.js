import axios from 'axios';
export default {
    command: 'تتستالك',
    aliases: ['tikstalk', 'ttprofile', 'ttstalk'],
    category: 'stalk',
    description: 'بحث تيكتوك مستخدم صورة شخصية',
    usage: '.تتستالك <مستخدمنامي>',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        if (!args.length) {
            return await sock.sendMessage(chatId, {
                text: '*Please provide a TikTok username.*\nExample: .ttstalk truepakistanofficial'
            }, { quoted: message });
        }
        const username = args[0];
        try {
            const { data } = await axios.get('https://discardapi.dpdns.org/api/stalk/tiktok', {
                params: { apikey: 'guru', username }
            });
            if (!data?.result?.user) {
                return await sock.sendMessage(chatId, { text: 'âŒ TikTok user not found.' }, { quoted: message });
            }
            const user = data.result.user;
            const stats = data.result.statsV2 || data.result.stats;
            const profileImage = user.avatarLarger || user.avatarMedium || user.avatarThumb;
            const verifiedMark = user.verified ? 'âœ… Verified' : '';
            const caption = `ðŸŽµ *TikTok Profile Info*\n\n` +
                `ðŸ‘¤ Nickname: ${user.nickname || 'N/A'} ${verifiedMark}\n` +
                `ðŸ†” Username: @${user.uniqueId || 'N/A'}\n` +
                `ðŸ“ Bio: ${user.signature || 'N/A'}\n` +
                `ðŸ”’ Private Account: ${user.privateAccount ? 'Yes' : 'No'}\n\n` +
                `ðŸ‘¥ Followers: ${stats?.followerCount || 0}\n` +
                `âž¡ Following: ${stats?.followingCount || 0}\n` +
                `â¤ï¸ Likes: ${stats?.heartCount || 0}\n` +
                `ðŸŽ¥ Videos: ${stats?.videoCount || 0}\n\n` +
                `ðŸ”— Profile URL: https://www.tiktok.com/@${user.uniqueId}`;
            if (profileImage) {
                await sock.sendMessage(chatId, { image: { url: profileImage }, caption }, { quoted: message });
            }
            else {
                await sock.sendMessage(chatId, { text: caption }, { quoted: message });
            }
        }
        catch (err) {
            console.error('TikTok plugin error:', err);
            await sock.sendMessage(chatId, { text: 'âŒ Failed to fetch TikTok profile.' }, { quoted: message });
        }
    }
};




