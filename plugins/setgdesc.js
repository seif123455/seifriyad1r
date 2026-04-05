export default {
    command: 'سيتجديسك',
    aliases: ['setdesc', 'groupdesc', 'setgdesc'],
    category: 'المشرفون',
    description: 'تغيير مجموعة وصف',
    usage: '.سيتجديسك <نيو وصف>',
    groupOnly: true,
    adminOnly: true,
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const desc = args.join(' ').trim();
        if (!desc) {
            await sock.sendMessage(chatId, {
                text: 'âŒ *Please provide a description*\n\nUsage: `.setgdesc <description>`'
            }, { quoted: message });
            return;
        }
        try {
            await sock.groupUpdateDescription(chatId, desc);
            await sock.sendMessage(chatId, {
                text: 'âœ… *Group description updated successfully!*'
            }, { quoted: message });
        }
        catch (error) {
            console.error('Error updating group description:', error);
            await sock.sendMessage(chatId, {
                text: 'âŒ *Failed to update group description*\n\nMake sure the bot is an admin.'
            }, { quoted: message });
        }
    }
};



