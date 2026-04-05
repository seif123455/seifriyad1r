import simpleGit from 'simple-git';
export default {
    command: 'جيتينفو',
    aliases: ['infogit', 'gitinfo'],
    category: 'المالك',
    description: 'عرض ديتايليد جيت ريبوسيتوري معلوماترماتيون',
    usage: '.جيتمعلومات',
    ownerOnly: true,
    async handler(sock, message) {
        const chatId = message.key.remoteJid;
        const git = simpleGit();
        try {
            const isRepo = await git.checkIsRepo();
            if (!isRepo) {
                return sock.sendMessage(chatId, { text: 'âŒ This project is not a git repository.' });
            }
            const status = await git.status();
            const branch = status.current || 'unknown';
            const dirty = status.files.length > 0;
            const commitHash = (await git.revparse(['--short', 'HEAD'])).trim();
            const ahead = status.ahead;
            const behind = status.behind;
            const modifiedCount = status.files.length;
            const remotes = await git.getRemotes(true);
            const remoteText = remotes.length
                ? remotes.map((r) => `â€¢ ${r.name}: ${r.refs.fetch}`).join('\n')
                : 'None';
            const warning = dirty ? 'âš ï¸ Warning: Working tree has uncommitted changes!' : '';
            const text = `ðŸ“¦ *Git Repository Info*\n\n` +
                `ðŸŒ¿ Branch: ${branch}\n` +
                `ðŸ”– Commit: ${commitHash}\n` +
                `ðŸ§¼ Working tree: ${dirty ? 'Dirty' : 'Clean'}\n` +
                `${dirty ? `${warning }\n\n` : ''}` +
                `ðŸ“Š Ahead: ${ahead}, Behind: ${behind}\n` +
                `ðŸ“ Modified/Untracked files: ${modifiedCount}\n\n` +
                `ðŸ”— Remotes:\n${remoteText}`;
            await sock.sendMessage(chatId, { text });
        }
        catch (err) {
            await sock.sendMessage(chatId, { text: `âŒ Git error: ${err.message}` });
        }
    }
};




