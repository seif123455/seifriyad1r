import { initConfig, saveConfig } from './autoreply.js';
export default {
    command: 'ديلريبلي',
    aliases: ['removereply', 'rmreply', 'delreply'],
    category: 'المالك',
    description: '',
    usage: '.ديلرد <تريججير>',
    ownerOnly: true,
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};
        if (!args || args.length === 0) {
            return await sock.sendMessage(chatId, {
                text: 'âŒ Please provide the trigger to delete.\n\nUsage: `.delreply hello`\nSee all triggers: `.listreplies`',
                ...channelInfo
            }, { quoted: message });
        }
        const trigger = args.join(' ').toLowerCase().trim();
        const config = await initConfig();
        const before = config.replies.length;
        config.replies = config.replies.filter(r => r.trigger !== trigger);
        if (config.replies.length === before) {
            return await sock.sendMessage(chatId, {
                text: `âŒ No auto-reply found for *"${trigger}"*\n\nUse \`.listreplies\` to see all triggers.`,
                ...channelInfo
            }, { quoted: message });
        }
        await saveConfig(config);
        await sock.sendMessage(chatId, {
            text: `ðŸ—‘ï¸ *Auto-reply deleted!*\n\nTrigger *"${trigger}"* has been removed.`,
            ...channelInfo
        }, { quoted: message });
    }
};




