import isAdmin from '../lib/isAdmin.js';
export default {
    command: 'ديساببيار',
    aliases: ['ephemeral', 'disappearing', 'vanish', 'disappear'],
    category: 'المشرفون',
    description: '',
    usage: '.ديساببيار وفف | .ديساببيار 24ه | .ديساببيار 7د | .ديساببيار 90د',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};
        const isGroup = chatId.endsWith('@g.us');
        const senderId = context.senderId || message.key.participant || message.key.remoteJid;
        const senderIsOwnerOrSudo = context.senderIsOwnerOrSudo || false;
        // Permission check
        if (isGroup && !senderIsOwnerOrSudo) {
            const { isSenderAdmin } = await isAdmin(sock, chatId, senderId);
            if (!isSenderAdmin) {
                return await sock.sendMessage(chatId, {
                    text: 'âŒ Only group admins or bot owner can change disappearing messages.',
                    ...channelInfo
                }, { quoted: message });
            }
        }
        if (!isGroup && !senderIsOwnerOrSudo && !message.key.fromMe) {
            return await sock.sendMessage(chatId, {
                text: 'âŒ Only the bot owner can change disappearing messages in DMs.',
                ...channelInfo
            }, { quoted: message });
        }
        const input = args[0]?.toLowerCase();
        if (!input) {
            return await sock.sendMessage(chatId, {
                text: `*â³ DISAPPEARING MESSAGES*\n\n` +
                    `*Usage:*\n` +
                    `â€¢ \`.disappear off\` â€” Disable\n` +
                    `â€¢ \`.disappear 24h\` â€” 24 hours\n` +
                    `â€¢ \`.disappear 7d\` â€” 7 days (default)\n` +
                    `â€¢ \`.disappear 90d\` â€” 90 days`,
                ...channelInfo
            }, { quoted: message });
        }
        const durations = {
            'off': false,
            '0': false,
            '24h': 86400,
            '1d': 86400,
            '7d': 604800,
            '1w': 604800,
            '90d': 7776000,
            '3m': 7776000,
        };
        if (!(input in durations)) {
            return await sock.sendMessage(chatId, {
                text: `âŒ Invalid option: *${input}*\n\nChoose: \`off\`, \`24h\`, \`7d\`, \`90d\``,
                ...channelInfo
            }, { quoted: message });
        }
        const seconds = durations[input];
        try {
            await sock.sendMessage(chatId, {
                disappearingMessagesInChat: seconds === false ? false : seconds
            });
            const labels = {
                'off': 'âŒ Disappearing messages *disabled*',
                '0': 'âŒ Disappearing messages *disabled*',
                '24h': 'â³ Disappearing messages set to *24 hours*',
                '1d': 'â³ Disappearing messages set to *24 hours*',
                '7d': 'â³ Disappearing messages set to *7 days*',
                '1w': 'â³ Disappearing messages set to *7 days*',
                '90d': 'â³ Disappearing messages set to *90 days*',
                '3m': 'â³ Disappearing messages set to *90 days*',
            };
            await sock.sendMessage(chatId, {
                text: labels[input],
                ...channelInfo
            }, { quoted: message });
        }
        catch (e) {
            console.error('[DISAPPEAR] Error:', e.message);
            await sock.sendMessage(chatId, {
                text: `âŒ Failed to change disappearing messages: ${e.message}`,
                ...channelInfo
            }, { quoted: message });
        }
    }
};



