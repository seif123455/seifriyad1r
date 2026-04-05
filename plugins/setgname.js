export default {
    command: 'سيتجنامي',
    aliases: ['setname', 'groupname', 'setgname'],
    category: 'المشرفون',
    description: 'تغيير مجموعة نامي',
    usage: '.سيتجنامي <نيو نامي>',
    groupOnly: true,
    adminOnly: true,
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const name = args.join(' ').trim();
        if (!name) {
            await sock.sendMessage(chatId, {
                text: 'âŒ *Please provide a group name*\n\nUsage: `.سيتجنامي <نيو نامي>`'
            }, { quoted: message });
            return;
        }
        try {
            await sock.groupUpdateSubject(chatId, name);
            await sock.sendMessage(chatId, {
                text: `âœ… *Group name updated to:*\n${name}`
            }, { quoted: message });
        }
        catch (error) {
            console.error('Error updating group name:', error);
            await sock.sendMessage(chatId, {
                text: 'âŒ *Failed to update group name*\n\nMake sure the bot is an admin.'
            }, { quoted: message });
        }
    }
};



