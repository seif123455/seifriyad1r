import { initConfig, saveConfig } from './autoreply.js';

export default {
    command: 'Ø±Ø¯ ØªÙ„Ù‚Ø§Ø¦ÙŠ',
    aliases: ['Ø±Ø¯', 'addreply', 'newtrigger', 'setreply', 'Ø§Ø¶Ø§ÙØ© Ø±Ø¯', 'Ø±Ø¯ Ø¢Ù„ÙŠ'],
    category: 'Ù…Ø§Ù„Ùƒ',
    description: 'Ø¥Ø¶Ø§ÙØ© Ø±Ø¯ ØªÙ„Ù‚Ø§Ø¦ÙŠ Ø¬Ø¯ÙŠØ¯ Ø¹Ù†Ø¯Ù…Ø§ ÙŠÙƒØªØ¨ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… ÙƒÙ„Ù…Ø© Ù…Ø¹ÙŠÙ†Ø©',
    usage: '.Ø±Ø¯ ØªÙ„Ù‚Ø§Ø¦ÙŠ <Ø§Ù„Ù…Ø´ØºÙ„> | <Ø§Ù„Ø±Ø¯>\Ù†\Ù†Ù…Ø«Ø§Ù„: .Ø±Ø¯ ØªÙ„Ù‚Ø§Ø¦ÙŠ Ù…Ø±Ø­Ø¨Ø§ | Ø£Ù‡Ù„Ø§Ù‹ Ø¨Ùƒ',
    ownerOnly: true,
    
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const senderId = context.senderId || message.key.remoteJid;
        const fullText = args.join(' ');
        const pipeIndex = fullText.indexOf('|');
        
        if (!fullText || pipeIndex === -1) {
            return await sock.sendMessage(chatId, {
                text: `*âž• Ø¥Ø¶Ø§ÙØ© Ø±Ø¯ ØªÙ„Ù‚Ø§Ø¦ÙŠ*\n\n` +
                    `*Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…:*\n` +
                    `\`.Ø±Ø¯ ØªÙ„Ù‚Ø§Ø¦ÙŠ <Ø§Ù„Ù…Ø´ØºÙ„> | <Ø§Ù„Ø±Ø¯>\`\n\n` +
                    `*Ø£Ù…Ø«Ù„Ø©:*\n` +
                    `â€¢ \`.Ø±Ø¯ ØªÙ„Ù‚Ø§Ø¦ÙŠ Ù…Ø±Ø­Ø¨Ø§ | Ø£Ù‡Ù„Ø§Ù‹ Ø¨Ùƒ! ðŸ‘‹\`\n` +
                    `â€¢ \`.Ø±Ø¯ ØªÙ„Ù‚Ø§Ø¦ÙŠ exact:ØµØ¨Ø§Ø­ Ø§Ù„Ø®ÙŠØ± | ØµØ¨Ø§Ø­ Ø§Ù„Ù†ÙˆØ±! â˜€ï¸\`\n` +
                    `â€¢ \`.Ø±Ø¯ ØªÙ„Ù‚Ø§Ø¦ÙŠ Ù…Ø±Ø­Ø¨Ø§ | Ù…Ø±Ø­Ø¨Ø§Ù‹ {name}! ÙƒÙŠÙ Ø­Ø§Ù„ÙƒØŸ\``
            }, { quoted: message });
        }
        
        let trigger = fullText.substring(0, pipeIndex).trim();
        const response = fullText.substring(pipeIndex + 1).trim();
        
        if (!trigger || !response) {
            return await sock.sendMessage(chatId, {
                text: 'âŒ *Ø§Ù„Ù…Ø´ØºÙ„ ÙˆØ§Ù„Ø±Ø¯ Ù…Ø·Ù„ÙˆØ¨Ø§Ù†.*'
            }, { quoted: message });
        }
        
        let exactMatch = false;
        if (trigger.toLowerCase().startsWith('exact:')) {
            exactMatch = true;
            trigger = trigger.substring(6).trim();
        }
        
        const config = await initConfig();
        const exists = config.replies.find(r => r.trigger === trigger.toLowerCase());
        
        if (exists) {
            return await sock.sendMessage(chatId, {
                text: `âš ï¸ *Ø§Ù„Ø±Ø¯ Ù„Ù€ "${trigger}" Ù…ÙˆØ¬ÙˆØ¯ Ø¨Ø§Ù„ÙØ¹Ù„!*`
            }, { quoted: message });
        }
        
        config.replies.push({
            trigger: trigger.toLowerCase(),
            response,
            exactMatch,
            addedBy: senderId,
            createdAt: Date.now()
        });
        
        await saveConfig(config);
        
        await sock.sendMessage(chatId, {
            text: `âœ… *ØªÙ… Ø¥Ø¶Ø§ÙØ© Ø§Ù„Ø±Ø¯ Ø§Ù„ØªÙ„Ù‚Ø§Ø¦ÙŠ!*\n\n` +
                `ðŸ”‘ *Ø§Ù„ÙƒÙ„Ù…Ø©:* ${trigger}\n` +
                `ðŸŽ¯ *Ø§Ù„Ù…Ø·Ø§Ø¨Ù‚Ø©:* ${exactMatch ? 'ØªØ§Ù…Ø©' : 'Ø§Ø­ØªÙˆØ§Ø¡'}\n` +
                `ðŸ’¬ *Ø§Ù„Ø±Ø¯:* ${response}`
        }, { quoted: message });
    }
};

