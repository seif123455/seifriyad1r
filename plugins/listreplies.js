import { initConfig } from './autoreply.js';
export default {
    command: 'ليستريبلييس',
    aliases: ['autoreplies', 'replylist', 'replies', 'listreplies'],
    category: 'المالك',
    description: 'قائمة الل كونفيجوريد اوتو-رد تريججيرس',
    usage: '.قائمةردود',
    ownerOnly: true,
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};
        const config = await initConfig();
        if (config.replies.length === 0) {
            return await sock.sendMessage(chatId, {
                text: `ðŸ“­ *No auto-replies configured yet*\n\nStatus: ${config.enabled ? 'âœ… Enabled' : 'âŒ Disabled'}\n\nUse \`.addreply <trigger> | <response>\` to add one!`,
                ...channelInfo
            }, { quoted: message });
        }
        const lines = config.replies.map((r, i) => {
            const preview = r.response.length > 40
                ? `${r.response.substring(0, 40) }...`
                : r.response;
            const matchIcon = r.exactMatch ? 'ðŸŽ¯' : 'ðŸ”';
            return `${i + 1}. ${matchIcon} *${r.trigger}*\n    â†³ ${preview}`;
        }).join('\n\n');
        await sock.sendMessage(chatId, {
            text: `*ðŸ¤– AUTO-REPLIES (${config.replies.length})*\n` +
                `*Status:* ${config.enabled ? 'âœ… Enabled' : 'âŒ Disabled'}\n\n` +
                `${lines}\n\n` +
                `ðŸŽ¯ = exact match | ðŸ” = contains\n` +
                `_Use .delreply <trigger> to remove one_`,
            ...channelInfo
        }, { quoted: message });
    }
};




