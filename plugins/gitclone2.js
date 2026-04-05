import axios from 'axios';
export default {
    command: 'جيتكلوني2',
    aliases: ['githubdl2', 'clone2', 'gitclone2'],
    category: 'التحميل',
    description: 'تحميل ا جيتهوب ريبوسيتوري اس ا زيب ملف',
    usage: '.جيتكلوني2 <جيتهوب-رابط>',
    async handler(sock, message, args, context) {
        const { chatId } = context;
        const regex = new RegExp('(?:https|git)(?://|@)github.com[/:]([^/:]+)/(.+)', 'i');
        try {
            const link = args[0];
            if (!link) {
                return await sock.sendMessage(chatId, {
                    text: `âŒ *Missing Link!*\n\nExample: .gitclone2 https://github.com/CrazySeif/MEGA-MD`
                }, { quoted: message });
            }
            if (!regex.test(link)) {
                return await sock.sendMessage(chatId, { text: 'âš ï¸ *Invalid GitHub link!*' }, { quoted: message });
            }
            // eslint-disable-next-line prefer-const
            let [_, user, repo] = link.match(regex) || [];
            repo = repo.replace(/.git$/, '');
            const url = `https://api.github.com/repos/${user}/${repo}/zipball`;
            const { default: _axios } = await import('axios');
            const _response = _axios.head;
            const headRes = await axios.head(url);
            const contentDisposition = headRes.headers['content-disposition'];
            let filename = `${repo}.zip`;
            if (contentDisposition) {
                const match = contentDisposition.match(/attachment; filename=(.*)/);
                if (match)
                    filename = match[1];
            }
            await sock.sendMessage(chatId, { text: `âœ³ï¸ *Wait, sending repository...*` }, { quoted: message });
            await sock.sendMessage(chatId, {
                document: { url },
                fileName: filename,
                mimetype: 'application/zip',
                caption: `ðŸ“¦ *Repository:* ${user}/${repo}\nâœ¨ *Cloned by MEGA-MD*`
            }, { quoted: message });
        }
        catch (err) {
            console.error('Gitclone Error:', err);
            await sock.sendMessage(chatId, { text: 'âŒ *Failed to download the repository.* Make sure it is public.' }, { quoted: message });
        }
    }
};




