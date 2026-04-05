export default {
    command: 'Ø§Ø±Ø´ÙŠÙ',
    aliases: ['archivechat', 'archive', 'unarchive', 'unarchivechat', 'ØªØ®Ø²ÙŠÙ†', 'Ø§Ø±Ø´ÙØ©'],
    category: 'Ø§Ù„Ù…Ø§Ù„Ùƒ',
    description: 'Ø£Ø±Ø´ÙØ© Ø£Ùˆ Ø¥Ù„ØºØ§Ø¡ Ø£Ø±Ø´ÙØ© Ø§Ù„Ù…Ø­Ø§Ø¯Ø«Ø© Ø§Ù„Ø­Ø§Ù„ÙŠØ©',
    usage: '!Ø§Ø±Ø´ÙŠÙ <Ø§Ø±Ø´ÙŠÙ|Ø§Ù„ØºØ§Ø¡>',
    ownerOnly: true,
    
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};
        const rawText = context.rawText || '';
        
        // ÙƒØ´Ù ØªÙ„Ù‚Ø§Ø¦ÙŠ Ù…Ù† Ø§Ø³Ù… Ø§Ù„Ø£Ù…Ø±
        const isUnarchive = rawText.toLowerCase().startsWith('!Ø§Ù„ØºØ§Ø¡') || 
                           rawText.toLowerCase().startsWith('!unarchive') ||
                           rawText.toLowerCase().startsWith('!unarchivechat');
        
        let action = args[0]?.toLowerCase();
        
        // ØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡ Ù…Ù† Ø§Ù„Ø£Ù…Ø± Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…
        if (!action) {
            if (isUnarchive) {
                action = 'Ø§Ù„ØºØ§Ø¡';
            } else {
                action = 'Ø§Ø±Ø´ÙŠÙ';
            }
        }
        
        // ØªØ­ÙˆÙŠÙ„ Ø§Ù„Ø£Ø³Ù…Ø§Ø¡ Ø§Ù„Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠØ©
        if (action === 'archive') action = 'Ø§Ø±Ø´ÙŠÙ';
        if (action === 'unarchive') action = 'Ø§Ù„ØºØ§Ø¡';
        
        if (!['Ø§Ø±Ø´ÙŠÙ', 'Ø§Ù„ØºØ§Ø¡'].includes(action)) {
            return await sock.sendMessage(chatId, {
                text: `*ðŸ“¦ Ø£Ø±Ø´ÙØ© Ø§Ù„Ù…Ø­Ø§Ø¯Ø«Ø©*\n\n*Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…:*\nâ€¢ \`!Ø§Ø±Ø´ÙŠÙ Ø§Ø±Ø´ÙŠÙ\` â€” Ø£Ø±Ø´ÙØ© Ù‡Ø°Ù‡ Ø§Ù„Ù…Ø­Ø§Ø¯Ø«Ø©\nâ€¢ \`!Ø§Ø±Ø´ÙŠÙ Ø§Ù„ØºØ§Ø¡\` â€” Ø¥Ù„ØºØ§Ø¡ Ø£Ø±Ø´ÙØ© Ù‡Ø°Ù‡ Ø§Ù„Ù…Ø­Ø§Ø¯Ø«Ø©\n\n*Ø£Ùˆ Ø§Ø³ØªØ®Ø¯Ù…:* \`!Ø§Ø±Ø´ÙŠÙ\` / \`!Ø§Ù„ØºØ§Ø¡\``,
                ...channelInfo
            }, { quoted: message });
        }
        
        const shouldArchive = action === 'Ø§Ø±Ø´ÙŠÙ';
        
        try {
            const lastMsg = message;
            await sock.chatModify({
                archive: shouldArchive,
                lastMessages: [
                    {
                        key: lastMsg.key,
                        messageTimestamp: lastMsg.messageTimestamp
                    }
                ]
            }, chatId);
            
            await sock.sendMessage(chatId, {
                text: shouldArchive
                    ? `ðŸ“¦ *ØªÙ…Øª Ø£Ø±Ø´ÙØ© Ø§Ù„Ù…Ø­Ø§Ø¯Ø«Ø©!*`
                    : `ðŸ“‚ *ØªÙ… Ø¥Ù„ØºØ§Ø¡ Ø£Ø±Ø´ÙØ© Ø§Ù„Ù…Ø­Ø§Ø¯Ø«Ø©!*`,
                ...channelInfo
            }, { quoted: message });
            
        } catch (e) {
            console.error('[ARCHIVECHAT] Ø®Ø·Ø£:', e.message);
            await sock.sendMessage(chatId, {
                text: `âŒ ÙØ´Ù„ ÙÙŠ ${shouldArchive ? 'Ø£Ø±Ø´ÙØ©' : 'Ø¥Ù„ØºØ§Ø¡ Ø£Ø±Ø´ÙØ©'} Ø§Ù„Ù…Ø­Ø§Ø¯Ø«Ø©: ${e.message}`,
                ...channelInfo
            }, { quoted: message });
        }
    }
};

