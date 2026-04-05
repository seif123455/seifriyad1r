export default {
    command: 'ينفيتيلينك',
    aliases: ['invite', 'grouplink', 'gclink', 'revokeinvite', 'resetlink', 'invitelink'],
    category: 'المجموعة',
    description: 'جلب ور ريفوكي تهي مجموعة ينفيتي رابط',
    usage: '.ينفيتيلينك â€” احصل رابط\ن.ريفوكيينفيتي â€” إعادة تعيين رابط',
    groupOnly: true,
    adminOnly: true,
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};
        const rawText = (context.rawText || '').toLowerCase();
        const isBotAdmin = context.isBotAdmin || false;
        const isRevoke = rawText.startsWith('.revokeinvite') || rawText.startsWith('.resetlink') || args[0]?.toLowerCase() === 'revoke';
        if (isRevoke && !isBotAdmin) {
            return await sock.sendMessage(chatId, {
                text: `âŒ Bot needs to be an admin to revoke the invite link.`,
                ...channelInfo
            }, { quoted: message });
        }
        try {
            if (isRevoke) {
                const newCode = await sock.groupRevokeInvite(chatId);
                return await sock.sendMessage(chatId, {
                    text: `ðŸ”„ *Invite link reset!*\n\n*New Link:*\nhttps://chat.whatsapp.com/${newCode}`,
                    ...channelInfo
                }, { quoted: message });
            }
            else {
                const code = await sock.groupInviteCode(chatId);
                return await sock.sendMessage(chatId, {
                    text: `ðŸ”— *Group Invite Link*\n\nhttps://chat.whatsapp.com/${code}\n\n_Use \`.revokeinvite\` to reset this link._`,
                    ...channelInfo
                }, { quoted: message });
            }
        }
        catch (e) {
            console.error('[INVITELINK] Error:', e.message);
            await sock.sendMessage(chatId, {
                text: `âŒ Failed: ${e.message}`,
                ...channelInfo
            }, { quoted: message });
        }
    }
};



