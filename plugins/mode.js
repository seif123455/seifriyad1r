import store from '../lib/lightweight_store.js';
/**
 * Advanced bot mode system with multiple access control options
 * Modes:
 * - public: Everyone can use (groups + private)
 * - private: Owner/sudo only
 * - groups: Only works in groups (everyone in groups)
 * - inbox: Only works in private chats (everyone in DM)
 * - self: Owner/sudo only (alias for private)
 */
async function modeCommand(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    const _senderId = message.key.participant || message.key.remoteJid;
    const isOwnerOrSudoCheck = message.key.fromMe || context.senderIsOwnerOrSudo || context.isOwnerOrSudoCheck;
    if (!isOwnerOrSudoCheck) {
        return await sock.sendMessage(chatId, {
            text: 'âŒ Only the owner or sudo users can change bot mode!',
            ...channelInfo
        }, { quoted: message });
    }
    const subCommand = args[0]?.toLowerCase();
    const currentMode = await store.getBotMode() || 'public';
    if (!subCommand || subCommand === 'status' || subCommand === 'check') {
        const modeEmojis = {
            public: 'ðŸŒ',
            private: 'ðŸ”’',
            groups: 'ðŸ‘¥',
            inbox: 'ðŸ’¬',
            self: 'ðŸ‘¤'
        };
        const modeDescriptions = {
            public: 'Everyone can use bot (groups + private chats)',
            private: 'Only owner and sudo users can use bot',
            groups: 'Only works in group chats (everyone in groups)',
            inbox: 'Only works in private chats (everyone in DMs)',
            self: 'Owner and sudo only (same as private)'
        };
        let statusText = `ðŸ“Š *BOT MODE STATUS*\n\n`;
        statusText += `Current Mode: ${modeEmojis[currentMode]} *${currentMode.toUpperCase()}*\n`;
        statusText += `Description: ${modeDescriptions[currentMode]}\n\n`;
        statusText += `â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”\n\n`;
        statusText += `*Available Modes:*\n\n`;
        Object.entries(modeDescriptions).forEach(([mode, desc]) => {
            const current = mode === currentMode ? 'âœ“ ' : '';
            statusText += `${current}${modeEmojis[mode]} \`${mode}\`\n${desc}\n\n`;
        });
        statusText += `*Usage:*\n`;
        statusText += `â€¢ \`.mode <mode>\` - Change mode\n`;
        statusText += `â€¢ \`.mode status\` - Show current mode\n\n`;
        statusText += `*Examples:*\n`;
        statusText += `â€¢ \`.mode public\` - Enable for everyone\n`;
        statusText += `â€¢ \`.mode groups\` - Groups only\n`;
        statusText += `â€¢ \`.mode inbox\` - Private chats only\n`;
        statusText += `â€¢ \`.mode private\` - Owner/sudo only`;
        return await sock.sendMessage(chatId, {
            text: statusText,
            ...channelInfo
        }, { quoted: message });
    }
    const validModes = ['public', 'private', 'groups', 'inbox', 'self'];
    if (!validModes.includes(subCommand)) {
        return await sock.sendMessage(chatId, {
            text: `âŒ Invalid mode: *${subCommand}*\n\nValid modes: ${validModes.join(', ')}\n\nUse \`.mode\` to see all available modes.`,
            ...channelInfo
        }, { quoted: message });
    }
    await store.setBotMode(subCommand);
    const modeEmojis = {
        public: 'ðŸŒ',
        private: 'ðŸ”’',
        groups: 'ðŸ‘¥',
        inbox: 'ðŸ’¬',
        self: 'ðŸ‘¤'
    };
    const modeMessages = {
        public: 'Bot is now accessible to *everyone* in groups and private chats.',
        private: 'Bot is now restricted to *owner and sudo users only*.',
        groups: 'Bot now works *only in group chats* (all group members can use it).',
        inbox: 'Bot now works *only in private chats* (all users can DM the bot).',
        self: 'Bot is now restricted to *owner and sudo users only*.'
    };
    await sock.sendMessage(chatId, {
        text: `${modeEmojis[subCommand]} *Mode Changed to ${subCommand.toUpperCase()}*\n\n${modeMessages[subCommand]}\n\n_Use \`.mode status\` to check current mode._`,
        ...channelInfo
    }, { quoted: message });
}
export default {
    command: 'وضع',
    aliases: ['botmode', 'setmode', 'mode'],
    category: 'المالك',
    description: 'ادفانكيد بوت اككيسس كونترول - تعيين وهو كان وسي تهي بوت اند وهيري',
    usage: '.مودي [بوبليك|بريفاتي|مجموعةس|ينبوكس|سيلف|حالة]',
    ownerOnly: true,
    handler: modeCommand
};



