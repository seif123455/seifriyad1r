export default {
    command: 'جكليافي',
    aliases: ['leavegroup', 'groupleave', 'leavegc', 'gcleave'],
    category: 'المالك',
    description: 'ماكي تهي بوت ليافي ا مجموعة',
    usage: '.جرووبليافي â€” ليافي كوررينت مجموعة\ن.جرووبليافي <جيد> â€” ليافي سبيكيفيك مجموعة',
    ownerOnly: true,
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};
        const targetJid = args[0]?.includes('@g.us') ? args[0] : chatId;
        if (!targetJid.endsWith('@g.us')) {
            return await sock.sendMessage(chatId, {
                text: `âŒ This command only works in groups.\n\nTo leave a specific group: \`.groupleave 1234567890-1234567890@g.us\``,
                ...channelInfo
            }, { quoted: message });
        }
        try {
            await sock.sendMessage(targetJid, {
                text: `ðŸ‘‹ *Bot is leaving the group.*\n\n_Goodbye everyone!_`,
                ...channelInfo
            });
            await new Promise(r => setTimeout(r, 500));
            await sock.groupLeave(targetJid);
            // If triggered from another chat, confirm there
            if (targetJid !== chatId) {
                await sock.sendMessage(chatId, {
                    text: `âœ… Left group: \`${targetJid}\``,
                    ...channelInfo
                }, { quoted: message });
            }
        }
        catch (e) {
            console.error('[GROUPLEAVE] Error:', e.message);
            await sock.sendMessage(chatId, {
                text: `âŒ Failed to leave group: ${e.message}`,
                ...channelInfo
            }, { quoted: message });
        }
    }
};



