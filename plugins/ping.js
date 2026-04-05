export default {
    command: 'Ø§Ø®ØªØ¨Ø§Ø± Ø§Ù„Ø³Ø±Ø¹Ø©',
    aliases: ['p', 'pong', 'ping'],
    category: 'Ø¹Ø§Ù…',
    description: 'ØªØ­Ù‚Ù‚ Ø¨ÙˆØª Ø²Ù…Ù† Ø§Ù„Ø§Ø³ØªØ¬Ø§Ø¨Ø©',
    usage: '.Ø¨ÙŠÙ†Ø¬',
    isPrefixless: true,
    async handler(sock, message, _args) {
        const start = Date.now();
        const chatId = message.key.remoteJid;
        const sent = await sock.sendMessage(chatId, {
            text: 'Pinging...'
        });
        const end = Date.now();
        await sock.sendMessage(chatId, {
            text: `ðŸ“ Pong!\nLatency: ${end - start}ms`,
            edit: sent.key
        });
    }
};


