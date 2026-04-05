export default {
    command: 'جكمتداتا',
    aliases: ['gcinfo', 'groupinfo', 'gcmetadata', 'groupdata', 'gcmtdata'],
    category: 'المجموعة',
    description: 'جلب ديتايليد معلومات ابووت تهي كوررينت مجموعة',
    usage: '.جكمعلومات',
    groupOnly: true,
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};
        try {
            const meta = await sock.groupMetadata(chatId);
            const admins = meta.participants.filter((p) => p.admin).map((p) => `  â€¢ @${p.id.split('@')[0]}`).join('\n');
            const created = meta.creation
                ? new Date(meta.creation * 1000).toLocaleDateString()
                : 'Unknown';
            const memberCount = meta.participants.length;
            const adminCount = meta.participants.filter((p) => p.admin).length;
            await sock.sendMessage(chatId, {
                text: `â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—\n` +
                    `â•‘    ðŸ“Š *GROUP INFO*       â•‘\n` +
                    `â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•\n\n` +
                    `*ðŸ“› Name:* ${meta.subject}\n` +
                    `*ðŸ“ Description:*\n${meta.desc || '_No description_'}\n\n` +
                    `*ðŸ‘¥ Members:* ${memberCount}\n` +
                    `*ðŸ‘‘ Admins:* ${adminCount}\n` +
                    `*ðŸ“… Created:* ${created}\n` +
                    `*ðŸ†” JID:* \`${meta.id}\`\n\n` +
                    `*ðŸ‘‘ Admin List:*\n${admins || '_None_'}`,
                mentions: meta.participants.filter((p) => p.admin).map((p) => p.id),
                ...channelInfo
            }, { quoted: message });
        }
        catch (e) {
            console.error('[GROUPMETADATA] Error:', e.message);
            await sock.sendMessage(chatId, {
                text: `âŒ Failed to fetch group info: ${e.message}`,
                ...channelInfo
            }, { quoted: message });
        }
    }
};




