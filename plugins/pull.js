import simpleGit from 'simple-git';
export default {
    command: 'Ø¬ÙŠØªØ¨ÙˆÙ„Ù„',
    aliases: ['refresh', 'pull', 'gitpull'],
    category: 'Ø§Ù„Ù…Ø§Ù„Ùƒ',
    description: 'Ø±ÙŠÙ„ÙˆØ§Ø¯ Ø§Ù„Ù„ Ø¨Ù„ÙˆØ¬ÙŠÙ†Ø³ (Ø¨ÙˆÙ„Ù„ ÙƒÙ‡Ø§Ù†Ø¬ÙŠØ³ ÙØ±ÙˆÙ… Ø¬ÙŠØª ÙŠÙ Ø§ÙØ§ÙŠÙ„Ø§Ø¨Ù„ÙŠ)',
    usage: '.Ø¬ÙŠØªØ¨ÙˆÙ„Ù„',
    ownerOnly: true,
    async handler(sock, message) {
        const chatId = message.key.remoteJid;
        const commandHandler = (await import('../lib/commandHandler.js')).default;
        const git = simpleGit();
        const start = Date.now();
        let gitStatus = 'Local reload only';
        try {
            const isRepo = await git.checkIsRepo();
            if (isRepo) {
                const remotes = await git.getRemotes(true);
                if (remotes.some((r) => r.name === 'origin')) {
                    await git.pull();
                    gitStatus = 'Pulled from git remote';
                }
            }
        }
        catch (err) {
            gitStatus = 'Git unavailable, used local files';
        }
        try {
            commandHandler.reloadCommands();
            const end = Date.now();
            await sock.sendMessage(chatId, {
                text: `âœ… Reload complete\n` +
                    `ðŸ”„ Mode: ${gitStatus}\n` +
                    `ðŸ“¦ Plugins: ${commandHandler.commands.size}\n` +
                    `â± Time: ${end - start}ms`
            });
        }
        catch (error) {
            await sock.sendMessage(chatId, {
                text: `âŒ Reload failed: ${error.message}`
            });
        }
    }
};


