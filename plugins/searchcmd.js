/*****************************************************************************
 *                                                                           *
 *                     Developed By Crazy Seif                                *
 *                                                                           *
 *  ðŸŒ  GitHub   : https://github.com/CrazySeif                         *
 *  â–¶ï¸  YouTube  : https://youtube.com/@CrazySeif                       *
 *  ðŸ’¬  WhatsApp : https://whatsapp.com/channel/0029VagJIAr3bbVBCpEkAM07     *
 *                                                                           *
 *    Â© 2026 CrazySeif. All rights reserved.                            *
 *                                                                           *
 *    Description: This file is part of the MEGA-MD Project.                 *
 *                 Unauthorized copying or distribution is prohibited.       *
 *                                                                           *
 *****************************************************************************/
import CommandHandler from '../lib/commandHandler.js';
export default {
    command: 'ÙÙŠÙ†Ø¯',
    aliases: ['lookup', 'searchcmd', 'find'],
    category: 'Ø¹Ø§Ù…',
    description: 'Ø¨Ø­Ø« Ø§ ÙƒÙˆÙ…Ù…Ø§Ù†Ø¯ Ø¨ÙŠ ÙƒÙŠÙŠÙˆÙˆØ±Ø¯ ÙˆØ± ÙˆØµÙ',
    usage: '.Ø¨Ø­Ø« [ÙƒÙŠÙŠÙˆÙˆØ±Ø¯]',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const query = args.join(' ').toLowerCase();
        if (!query) {
            return await sock.sendMessage(chatId, { text: 'What are you looking for? Example: *.find status*' }, { quoted: message });
        }
        try {
            const allCommands = Array.from(CommandHandler.commands.values());
            const results = allCommands.filter(commandObject => {
                const nameMatch = commandObject.command?.toLowerCase().includes(query);
                const descMatch = commandObject.description?.toLowerCase().includes(query);
                const aliasMatch = commandObject.aliases?.some((a) => a.toLowerCase().includes(query));
                return nameMatch || descMatch || aliasMatch;
            });
            if (results.length === 0) {
                const suggestion = CommandHandler.findSuggestion(query);
                let failText = `âŒ No commands found matching *"${query}"*`;
                if (suggestion)
                    failText += `\n\nDid you mean: *.${suggestion}*?`;
                return await sock.sendMessage(chatId, { text: failText }, { quoted: message });
            }
            let resultText = `ðŸ” *SEARCH RESULTS FOR:* "${query.toUpperCase()}"\n\n`;
            results.forEach((res, index) => {
                const status = CommandHandler.disabledCommands.has(res.command.toLowerCase()) ? 'ðŸ”¸' : 'ðŸ”¹';
                resultText += `${index + 1}. ${status} *.${res.command}*\n`;
                resultText += `ðŸ“ _${res.description || 'No description available.'}_\n`;
                if (res.aliases && res.aliases.length > 0) {
                    resultText += `ðŸ”— Aliases: ${res.aliases.join(', ')}\n`;
                }
                resultText += `\n`;
            });
            resultText += `ðŸ’¡ _Tip: Use the prefix before the command name to run it._`;
            await sock.sendMessage(chatId, { text: resultText }, { quoted: message });
        }
        catch (error) {
            console.error('Search Error:', error);
            await sock.sendMessage(chatId, { text: 'âŒ An error occurred during the search.' });
        }
    }
};
/*****************************************************************************
 *                                                                           *
 *                     Developed By Crazy Seif                                *
 *                                                                           *
 *  ðŸŒ  GitHub   : https://github.com/CrazySeif                         *
 *  â–¶ï¸  YouTube  : https://youtube.com/@CrazySeif                       *
 *  ðŸ’¬  WhatsApp : https://whatsapp.com/channel/0029VagJIAr3bbVBCpEkAM07     *
 *                                                                           *
 *    Â© 2026 CrazySeif. All rights reserved.                            *
 *                                                                           *
 *    Description: This file is part of the MEGA-MD Project.                 *
 *                 Unauthorized copying or distribution is prohibited.       *
 *                                                                           *
 *****************************************************************************/


