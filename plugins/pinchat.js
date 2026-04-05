export default {
    command: 'Ø¨ÙŠÙ†ÙƒÙ‡Ø§Øª',
    aliases: ['pin', 'unpin', 'unpinchat', 'pinchat'],
    category: 'Ø§Ù„Ù…Ø§Ù„Ùƒ',
    description: 'ØªØ«Ø¨ÙŠØª ÙˆØ± Ø¥Ù„ØºØ§Ø¡ Ø§Ù„ØªØ«Ø¨ÙŠØª ØªÙ‡ÙŠ ÙƒÙˆØ±Ø±ÙŠÙ†Øª Ø¯Ø±Ø¯Ø´Ø©',
    usage: '.Ø¨ÙŠÙ†ÙƒÙ‡Ø§Øª ØªØ«Ø¨ÙŠØª | .Ø¨ÙŠÙ†ÙƒÙ‡Ø§Øª Ø¥Ù„ØºØ§Ø¡ Ø§Ù„ØªØ«Ø¨ÙŠØª',
    ownerOnly: true,
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};
        const rawText = (context.rawText || '').toLowerCase();
        const shouldPin = !rawText.startsWith('.unpin');
        try {
            await sock.chatModify({ pin: shouldPin }, chatId);
            await sock.sendMessage(chatId, {
                text: shouldPin ? `ðŸ“Œ *Chat pinned!*` : `ðŸ“Œ *Chat unpinned!*`,
                ...channelInfo
            }, { quoted: message });
        }
        catch (e) {
            console.error('[PINCHAT] Error:', e.message);
            await sock.sendMessage(chatId, {
                text: `âŒ Failed to ${shouldPin ? 'pin' : 'unpin'} chat: ${e.message}`,
                ...channelInfo
            }, { quoted: message });
        }
    }
};


