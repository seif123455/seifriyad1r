import pkg from 'api-qasim';
const QasimAny = pkg;
export default {
    command: 'نبمستالك',
    aliases: ['npmstlk', 'npmstalk'],
    category: 'stalk',
    description: 'جلب تفاصيل ابووت ان نبم باككاجي',
    usage: '.نبمستالك <باككاجي-نامي>',
    async handler(sock, message, args, context) {
        const { chatId } = context;
        if (!args[0]) {
            return await sock.sendMessage(chatId, {
                text: `âœ³ï¸ Please provide an NPM package name.\n\nExample:\n.npmstalk axios`
            }, { quoted: message });
        }
        try {
            const res = await QasimAny.npmStalk(args[0]);
            if (!res || !res.result) {
                throw new Error('Package not found or API error.');
            }
            const data = res.result;
            const authorName = (typeof data.author === 'object') ? data.author.name : (data.author || 'Unknown');
            const versionCount = data.versions ? Object.keys(data.versions).length : 0;
            let te = `â”Œâ”€â”€ã€Œ *NPM PACKAGE INFO* ã€\n`;
            te += `â–¢ *ðŸ”–Name:* ${data.name}\n`;
            te += `â–¢ *ðŸ”–Creator:* ${authorName}\n`;
            te += `â–¢ *ðŸ‘¥Total Versions:* ${versionCount}\n`;
            te += `â–¢ *ðŸ“ŒDescription:* ${data.description || 'No description'}\n`;
            te += `â–¢ *ðŸ§©Repository:* ${data.repository?.url || 'No repository available'}\n`;
            te += `â–¢ *ðŸŒHomepage:* ${data.homepage || 'No homepage available'}\n`;
            te += `â–¢ *ðŸ·ï¸Latest:* ${data['dist-tags']?.latest || 'N/A'}\n`;
            te += `â–¢ *ðŸ”—Link:* https://npmjs.com/package/${data.name}\n`;
            te += `â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€`;
            await sock.sendMessage(chatId, { text: te }, { quoted: message });
        }
        catch (error) {
            console.error('NPM Stalk Error:', error);
            await sock.sendMessage(chatId, { text: `âœ³ï¸ Error: Package not found or API issue.` }, { quoted: message });
        }
    }
};



