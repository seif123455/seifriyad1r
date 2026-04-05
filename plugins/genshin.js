import axios from 'axios';
// Utility to decode Unicode escapes
function decodeUnicode(str) {
    if (!str)
        return 'N/A';
    return str.replace(/\\u[\dA-F]{4}/gi, (match) => String.fromCharCode(parseInt(match.replace("\\u", ""), 16)));
}
export default {
    command: 'Ø¬ÙŠÙ†Ø³Ù‡ÙŠÙ†',
    aliases: ['gh', 'uid', 'genshin'],
    category: 'stalk',
    description: 'Ø³ØªØ§Ù„Ùƒ Ø¬ÙŠÙ†Ø³Ù‡ÙŠÙ† ÙŠÙ…Ø¨Ø§ÙƒØª ÙˆÙŠØ¯',
    usage: '.Ø¬ÙŠÙ†Ø³Ù‡ÙŠÙ† <ÙˆÙŠØ¯>',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        if (!args.length) {
            return await sock.sendMessage(chatId, {
                text: '*Please provide a Genshin UID.*\nExample: .genshin 826401293'
            }, { quoted: message });
        }
        const uid = args[0];
        try {
            const { data } = await axios.get(`https://discardapi.dpdns.org/api/stalk/genshin`, {
                params: { apikey: 'guru', text: uid }
            });
            if (!data?.result) {
                return await sock.sendMessage(chatId, { text: 'âŒ UID not found or invalid.' }, { quoted: message });
            }
            const result = data.result;
            const caption = `ðŸŽ® *Genshin UID Info*\n\n` +
                `ðŸ‘¤ Nickname: ${result.nickname || 'N/A'}\n` +
                `ðŸ†” UID: ${result.uid || 'N/A'}\n` +
                `ðŸ† Achievements: ${result.achivement || 'N/A'}\n` +
                `âš¡ Level: ${result.level || 'N/A'}\n` +
                `ðŸŒŒ World Level: ${result.world_level || 'N/A'}\n` +
                `ðŸŒ€ Spiral Abyss: ${decodeUnicode(result.spiral_abyss)}\n` +
                `ðŸ’³ Card ID: ${result.card_id || 'N/A'}`;
            await sock.sendMessage(chatId, { image: { url: result.image }, caption }, { quoted: message });
        }
        catch (err) {
            console.error('Genshin plugin error:', err);
            await sock.sendMessage(chatId, { text: 'âŒ Failed to fetch UID info.' }, { quoted: message });
        }
    }
};


