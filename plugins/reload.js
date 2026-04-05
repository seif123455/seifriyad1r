export default {
    command: 'Ø±ÙŠÙ„ÙˆØ§Ø¯',
    aliases: ['refresh', 'reloadplugins', 'reload'],
    category: 'Ø§Ù„Ù…Ø§Ù„Ùƒ',
    description: 'Ø±ÙŠÙ„ÙˆØ§Ø¯ Ø§Ù„Ù„ Ø¨Ù„ÙˆØ¬ÙŠÙ†Ø³',
    usage: '.Ø±ÙŠÙ„ÙˆØ§Ø¯',
    ownerOnly: true,
    async handler(sock, message, _args) {
        const chatId = message.key.remoteJid;
        const commandHandler = (await import('../lib/commandHandler.js')).default;
        try {
            const start = Date.now();
            commandHandler.Ø±ÙŠÙ„ÙˆØ§Ø¯Commands();
            const end = Date.now();
            await sock.sendMessage(chatId, {
                text: `âœ… Reloaded ${commandHandler.commands.size} commands in ${end - start}ms`
            });
        }
        catch (error) {
            await sock.sendMessage(chatId, {
                text: `âŒ Reload failed: ${error.message}`
            });
        }
    }
};


