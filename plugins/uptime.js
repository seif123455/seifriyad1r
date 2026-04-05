/*****************************************************************************
 *                                                                           *
 *                     Developed By Crazy Seif                               *
 *                                                                           *
 *  ðŸ“ž  WhatsApp : 01144534147                                              *
 *                                                                           *
 *    Â© 2026 Crazy Seif. All rights reserved.                               *
 *                                                                           *
 *    Description: This file is part of the Crazy Seif BOT Project.          *
 *                                                                           *
 *****************************************************************************/
export default {
    command: 'ØªØ´ØºÙŠÙ„',
    aliases: ['uptime', 'runtime', 'Ø­Ø§Ù„Ø©_Ø§Ù„Ø¨ÙˆØª', 'Ù…Ø¯Ø©_Ø§Ù„ØªØ´ØºÙŠÙ„'],
    category: 'Ø¹Ø§Ù…',
    description: 'Ø¹Ø±Ø¶ Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø­Ø§Ù„Ø© Ø§Ù„Ø¨ÙˆØª ÙˆÙ…Ø¯Ø© Ø§Ù„ØªØ´ØºÙŠÙ„',
    usage: '!ØªØ´ØºÙŠÙ„',
    isPrefixless: false,
    
    async handler(sock, message) {
        const chatId = message.key.remoteJid;
        const commandHandler = (await import('../lib/commandHandler.js')).default;
        
        const uptimeMs = process.uptime() * 1000;
        
        const formatUptime = (ms) => {
            const sec = Math.floor(ms / 1000) % 60;
            const min = Math.floor(ms / (1000 * 60)) % 60;
            const hr = Math.floor(ms / (1000 * 60 * 60)) % 24;
            const day = Math.floor(ms / (1000 * 60 * 60 * 24));
            const parts = [];
            if (day) parts.push(`${day} ÙŠÙˆÙ…`);
            if (hr) parts.push(`${hr} Ø³Ø§Ø¹Ø©`);
            if (min) parts.push(`${min} Ø¯Ù‚ÙŠÙ‚Ø©`);
            parts.push(`${sec} Ø«Ø§Ù†ÙŠØ©`);
            return parts.join(' ');
        };
        
        const startedAt = new Date(Date.now() - uptimeMs).toLocaleString('ar-EG');
        const ramMb = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
        const commandCount = commandHandler.commands.size;
        
        const text = `ðŸ¤– *Ø­Ø§Ù„Ø© Crazy Seif BOT*\n\n` +
            `â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”“\n` +
            `â”ƒ â± *Ù…Ø¯Ø© Ø§Ù„ØªØ´ØºÙŠÙ„:* ${formatUptime(uptimeMs)}\n` +
            `â”ƒ ðŸš€ *ØªØ§Ø±ÙŠØ® Ø§Ù„Ø¨Ø¯Ø¡:* ${startedAt}\n` +
            `â”ƒ ðŸ“¦ *Ø¹Ø¯Ø¯ Ø§Ù„Ø£ÙˆØ§Ù…Ø±:* ${commandCount}\n` +
            `â”ƒ ðŸ’¾ *Ø§Ù„Ø°Ø§ÙƒØ±Ø© Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…Ø©:* ${ramMb} Ù…ÙŠØ¬Ø§Ø¨Ø§ÙŠØª\n` +
            `â”—â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”›\n\n` +
            `ðŸ”¥ *Crazy Seif BOT* | ðŸ“ž 01144534147`;
        
        await sock.sendMessage(chatId, { text });
    }
};

/*****************************************************************************
 *                                                                           *
 *                     Developed By Crazy Seif                               *
 *                                                                           *
 *  ðŸ“ž  WhatsApp : 01144534147                                              *
 *                                                                           *
 *    Â© 2026 Crazy Seif. All rights reserved.                               *
 *                                                                           *
 *    Description: This file is part of the Crazy Seif BOT Project.          *
 *                                                                           *
 *****************************************************************************/

