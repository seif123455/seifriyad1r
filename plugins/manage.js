import CommandHandler from '../lib/commandHandler.js';
export default {
    command: 'ماناجي',
    aliases: ['ctrl', 'control', 'manage'],
    category: 'المالك',
    description: 'إدارة بوت كومماندس اند أسماء بديلة',
    usage: '.إدارة [تبديل/الياس] [كومماند_نامي] [نيو_الياس]',
    ownerOnly: true,
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const action = args[0]?.toLowerCase();
        const targetCmd = args[1]?.toLowerCase();
        try {
            if (action === 'toggle') {
                if (!CommandHandler.commands.has(targetCmd)) {
                    return await sock.sendMessage(chatId, { text: `âŒ Command *${targetCmd}* not found.` }, { quoted: message });
                }
                const state = CommandHandler.toggleCommand(targetCmd);
                return await sock.sendMessage(chatId, { text: `âœ… Command *${targetCmd}* has been *${state}*.` }, { quoted: message });
            }
            if (action === 'alias') {
                const newAlias = args[2]?.toLowerCase();
                if (!targetCmd || !newAlias) {
                    return await sock.sendMessage(chatId, { text: 'âŒ Usage: .manage alias [command] [new_alias]' }, { quoted: message });
                }
                if (!CommandHandler.commands.has(targetCmd)) {
                    return await sock.sendMessage(chatId, { text: `âŒ Source command *${targetCmd}* not found.` }, { quoted: message });
                }
                CommandHandler.aliases.set(newAlias, targetCmd);
                return await sock.sendMessage(chatId, { text: `âœ… Added alias *${newAlias}* for command *${targetCmd}*.` }, { quoted: message });
            }
            const helpText = `ðŸ› ï¸ *COMMAND MANAGER*\n\n` +
                `*â â€¢ Toggle:* .manage toggle [name]\n` +
                `*â€¢ Alias:* .manage alias [name] [new_alias]\n` +
                `*â€¢ Reload:* Run your reload command to reset changes.`;
            await sock.sendMessage(chatId, { text: helpText }, { quoted: message });
        }
        catch (error) {
            console.error('Error in manage plugin:', error);
            await sock.sendMessage(chatId, { text: 'âŒ Management action failed.' }, { quoted: message });
        }
    }
};




