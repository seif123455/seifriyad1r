export default {
    command: 'ÙƒØªÙ…',
    aliases: ['unmute', 'unsilence', 'Ø§Ù„ØºØ§Ø¡_Ø§Ù„ÙƒØªÙ…', 'ÙØªØ­_Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹Ø©'],
    category: 'Ø§Ù„Ù…Ø´Ø±ÙÙˆÙ†',
    description: 'Ø¥Ù„ØºØ§Ø¡ ÙƒØªÙ… Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹Ø© (Ø§Ù„Ø³Ù…Ø§Ø­ Ù„Ù„Ø£Ø¹Ø¶Ø§Ø¡ Ø¨Ø§Ù„ÙƒØªØ§Ø¨Ø©)',
    usage: '!ÙƒØªÙ…',
    groupOnly: true,
    adminOnly: true,
    
    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        
        try {
            await sock.groupSettingUpdate(chatId, 'not_announcement');
            await sock.sendMessage(chatId, {
                text: 'ðŸ”“ *ØªÙ… Ø¥Ù„ØºØ§Ø¡ ÙƒØªÙ… Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹Ø©*\n\nÙŠÙ…ÙƒÙ† Ù„Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø£Ø¹Ø¶Ø§Ø¡ Ø§Ù„Ø¢Ù† Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø±Ø³Ø§Ø¦Ù„.\n\nðŸ”¥ *Crazy Seif BOT* | ðŸ“ž 01144534147',
                ...channelInfo
            }, { quoted: message });
        } catch (error) {
            console.error('Ø®Ø·Ø£ ÙÙŠ Ø¥Ù„ØºØ§Ø¡ ÙƒØªÙ… Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹Ø©:', error);
            await sock.sendMessage(chatId, {
                text: 'âŒ ÙØ´Ù„ ÙÙŠ Ø¥Ù„ØºØ§Ø¡ ÙƒØªÙ… Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹Ø©. ØªØ£ÙƒØ¯ Ù…Ù† Ø£Ù† Ø§Ù„Ø¨ÙˆØª Ø£Ø¯Ù…Ù†.',
                ...channelInfo
            }, { quoted: message });
        }
    }
};

