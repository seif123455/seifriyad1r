export default {
    command: 'بولل',
    aliases: ['createpoll', 'newpoll', 'poll'],
    category: 'المجموعة',
    description: 'إنشاء ا ناتيفي وهاتسابب استفتاء ين تهي مجموعة',
    usage: '.استفتاء <قويستيون> | <وبتيون1> | <وبتيون2> | ...',
    groupOnly: true,
    adminOnly: true,
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};
        const fullText = args.join(' ');
        const parts = fullText.split('|').map((p) => p.trim()).filter(Boolean);
        if (parts.length < 3) {
            return await sock.sendMessage(chatId, {
                text: `*ðŸ“Š CREATE A POLL*\n\n` +
                    `*Usage:*\n\`.استفتاء <Question> | <Option1> | <Option2> | ...\`\n\n` +
                    `*Example:*\n\`.poll Favourite color? | Red | Blue | Green | Yellow\`\n\n` +
                    `_Minimum 2 options. Maximum 12 options._`,
                ...channelInfo
            }, { quoted: message });
        }
        const question = parts[0];
        const options = parts.slice(1);
        if (options.length > 12) {
            return await sock.sendMessage(chatId, {
                text: 'âŒ Maximum 12 options allowed.',
                ...channelInfo
            }, { quoted: message });
        }
        try {
            await sock.sendMessage(chatId, {
                poll: {
                    name: question,
                    values: options,
                    selectableCount: 1
                }
            });
        }
        catch (e) {
            console.error('[POLL] Error sending poll:', e.message);
            await sock.sendMessage(chatId, {
                text: 'âŒ Failed to create poll. Please try again.',
                ...channelInfo
            }, { quoted: message });
        }
    }
};




