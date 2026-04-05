import axios from 'axios';
export default {
    command: 'تجستالك',
    aliases: ['tguser', 'tginfo', 'tgstalk'],
    category: 'stalk',
    description: 'بحث تيليجرام قناة ور مستخدم',
    usage: '.تجستالك <مستخدمنامي>',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        if (!args.length) {
            return await sock.sendMessage(chatId, {
                text: '*Please provide a Telegram username.*\nExample: .tginfo GlobalTechBots'
            }, { quoted: message });
        }
        const username = args[0];
        try {
            const apiUrl = `https://discardapi.onrender.com/api/stalk/telegram?apikey=guru&url=${username}`;
            const { data } = await axios.get(apiUrl, {
                timeout: 45000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            if (!data?.result) {
                return await sock.sendMessage(chatId, { text: 'âŒ Telegram user/channel not found.' }, { quoted: message });
            }
            const result = data.result;
            const profileImage = result.image_url || null;
            const caption = `ðŸ“± *Telegram Info*\n\n` +
                `ðŸ‘¤ Title: ${result.title || 'N/A'}\n` +
                `ðŸ“ Description: ${result.description || 'N/A'}\n` +
                `ðŸ”— Link: ${result.url || `https://t.me/${username}`}`;
            if (profileImage) {
                await sock.sendMessage(chatId, { image: { url: profileImage }, caption }, { quoted: message });
            }
            else {
                await sock.sendMessage(chatId, { text: caption }, { quoted: message });
            }
        }
        catch (err) {
            console.error('Telegram plugin error:', err);
            await sock.sendMessage(chatId, { text: 'âŒ Failed to fetch Telegram info.' }, { quoted: message });
        }
    }
};




