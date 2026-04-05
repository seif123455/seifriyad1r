export default {
    command: 'جكسيت',
    aliases: ['gsetting', 'groupset', 'gpset', 'gcset'],
    category: 'المشرفون',
    description: 'تغيير مجموعة إعدادات (لوكك/ونلوكك رسالةس ور إعدادات)',
    usage: '.جكسيت <سيتتينج>',
    groupOnly: true,
    adminOnly: true,
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};
        const isBotAdmin = context.isBotAdmin || false;
        if (!isBotAdmin) {
            return await sock.sendMessage(chatId, {
                text: `âŒ Bot needs to be an admin to change group settings.`,
                ...channelInfo
            }, { quoted: message });
        }
        const setting = args[0]?.toLowerCase();
        if (!setting) {
            return await sock.sendMessage(chatId, {
                text: `â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—\n` +
                    `â•‘âš™ï¸ *GROUP SETTINGS*   â•‘\n` +
                    `â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•\n\n` +
                    `ðŸ“Œ *Usage:* \`.gcset <option>\`\n\n` +
                    `â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\n` +
                    `*ðŸ’¬ MESSAGE PERMISSIONS*\n` +
                    `ðŸ”’ *lock* â€” Only admins can send messages\n\n` +
                    `ðŸ”“ *unlock* â€” Everyone can send messages\n\n` +
                    `*ðŸ› ï¸ SETTINGS PERMISSIONS*\n` +
                    `ðŸ”’ *lockset* â€” Only admins can edit group info\n\n` +
                    `ðŸ”“ *unlockset* â€” Everyone can edit group info\n` +
                    `â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€`,
                ...channelInfo
            }, { quoted: message });
        }
        const settingsMap = {
            lock: { value: 'announcement', label: 'ðŸ”’ Only admins can send messages' },
            unlock: { value: 'not_announcement', label: 'ðŸ”“ Everyone can send messages' },
            lockset: { value: 'locked', label: 'ðŸ”’ Only admins can edit group info' },
            unlockset: { value: 'unlocked', label: 'ðŸ”“ Everyone can edit group info' },
        };
        const config = settingsMap[setting];
        if (!config) {
            return await sock.sendMessage(chatId, {
                text: `âŒ Unknown setting: *${setting}*\n\nUse \`.groupsettings\` to see options.`,
                ...channelInfo
            }, { quoted: message });
        }
        try {
            await sock.groupSettingUpdate(chatId, config.value);
            return await sock.sendMessage(chatId, {
                text: `âœ… ${config.label}`,
                ...channelInfo
            }, { quoted: message });
        }
        catch (e) {
            console.error('[GROUPSETTINGS] Error:', e.message);
            return await sock.sendMessage(chatId, {
                text: `âŒ Failed to update setting: ${e.message}`,
                ...channelInfo
            }, { quoted: message });
        }
    }
};



