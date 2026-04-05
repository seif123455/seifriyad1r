export default {
    command: 'ريسيتلينك',
    aliases: ['revoke', 'newlink', 'resetlink'],
    category: 'المشرفون',
    description: 'إعادة تعيين مجموعة ينفيتي رابط',
    usage: '.إعادة تعيينرابط',
    groupOnly: true,
    adminOnly: true,
    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        try {
            const newCode = await sock.groupRevokeInvite(chatId);
            await sock.sendMessage(chatId, {
                text: `âœ… Group link has been successfully reset\n\nðŸ”— New link:\nhttps://chat.whatsapp.com/${newCode}`,
                ...channelInfo
            }, { quoted: message });
        }
        catch (error) {
            console.error('Error in resetlink command:', error);
            await sock.sendMessage(chatId, {
                text: 'Failed to reset group link!',
                ...channelInfo
            }, { quoted: message });
        }
    }
};




