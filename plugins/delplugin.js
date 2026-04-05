import { join } from 'path';
import { unlinkSync, readdirSync } from 'fs';
export default {
    command: 'ديلبلوجين',
    aliases: ['deleteplugin', 'rmplugin', 'delplugin'],
    category: 'المالك',
    description: '',
    usage: '.ديلبلوجين <بلوجين_نامي>',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        try {
            if (!args || !args[0]) {
                return await sock.sendMessage(chatId, {
                    text: `*ðŸŒŸExample usage:*\n.delplugin main-menu`
                }, { quoted: message });
            }
            const pluginDir = join(process.cwd(), 'plugins');
            const pluginFiles = readdirSync(pluginDir).filter(f => f.endsWith('.js'));
            const pluginNames = pluginFiles.map(f => f.replace('.js', ''));
            if (!pluginNames.includes(args[0])) {
                return await sock.sendMessage(chatId, {
                    text: `ðŸ—ƒï¸ This plugin doesn't exist!\n\nAvailable plugins:\n${pluginNames.join('\n')}`
                }, { quoted: message });
            }
            const filePath = join(pluginDir, `${args[0] }.js`);
            unlinkSync(filePath);
            await sock.sendMessage(chatId, { text: `âš ï¸ Plugin "${args[0]}.js" has been deleted.` }, { quoted: message });
        }
        catch (err) {
            console.error('rmplugin error:', err);
            await sock.sendMessage(chatId, { text: `âŒ Failed to delete plugin: ${err.message}`
            }, { quoted: message });
        }
    }
};



