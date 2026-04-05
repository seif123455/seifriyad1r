export default {
    command: 'سهيب',
    aliases: ['couple', 'ship'],
    category: 'المجموعة',
    description: 'عشوائيلي سهيب توو عضوس ين تهي مجموعة',
    usage: '.سهيب',
    groupOnly: true,
    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        try {
            const participants = await sock.groupMetadata(chatId);
            const ps = participants.participants.map((v) => v.id);
            const firstUser = ps[Math.floor(Math.random() * ps.length)];
            let secondUser;
            do {
                secondUser = ps[Math.floor(Math.random() * ps.length)];
            } while (secondUser === firstUser);
            const formatMention = (id) => `@${ id.split('@')[0]}`;
            await sock.sendMessage(chatId, {
                text: `${formatMention(firstUser)} â¤ï¸ ${formatMention(secondUser)}\nCongratulations ðŸ’–ðŸ»`,
                mentions: [firstUser, secondUser],
                ...channelInfo
            });
        }
        catch (error) {
            console.error('Error in ship command:', error);
            await sock.sendMessage(chatId, {
                text: 'âŒ Failed to ship! Make sure this is a group.',
                ...channelInfo
            }, { quoted: message });
        }
    }
};



