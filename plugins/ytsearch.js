/*****************************************************************************
 *                                                                           *
 *                     Developed By Crazy Seif                               *
 *                                                                           *
 *  ðŸ“ž  WhatsApp : 01144534147                                              *
 *                                                                           *
 *    Â© 2026 Crazy Seif. All rights reserved.                               *
 *                                                                           *
 *****************************************************************************/
import yts from 'yt-search';

export default {
    command: 'ÙŠÙˆØªÙŠÙˆØ¨',
    aliases: ['ytsearch', 'yts', 'playlist', 'playlista', 'Ø¨Ø­Ø«_ÙŠÙˆØªÙŠÙˆØ¨', 'ÙŠÙˆØª'],
    category: 'Ø§Ù„ØªØ­Ù…ÙŠÙ„',
    description: 'Ø§Ù„Ø¨Ø­Ø« Ø¹Ù† ÙÙŠØ¯ÙŠÙˆÙ‡Ø§Øª ÙÙŠ ÙŠÙˆØªÙŠÙˆØ¨',
    usage: '!ÙŠÙˆØªÙŠÙˆØ¨ <Ù†Øµ Ø§Ù„Ø¨Ø­Ø«>',
    
    async handler(sock, message, args, context) {
        const { chatId, config } = context;
        const query = args.join(' ');
        const prefix = '!';
        
        if (!query) {
            return sock.sendMessage(chatId, {
                text: `ðŸ” *Ø§Ù„Ø¨Ø­Ø« ÙÙŠ ÙŠÙˆØªÙŠÙˆØ¨*\n\n` +
                    `*Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…:* \`${prefix}ÙŠÙˆØªÙŠÙˆØ¨ <Ù†Øµ Ø§Ù„Ø¨Ø­Ø«>\`\n` +
                    `*Ù…Ø«Ø§Ù„:* \`${prefix}ÙŠÙˆØªÙŠÙˆØ¨ Ù…Ø­Ù…Ø¯ Ù…Ù†ÙŠØ±\``
            }, { quoted: message });
        }
        
        try {
            await sock.sendMessage(chatId, { react: { text: 'ðŸ”', key: message.key } });
            
            const result = await yts(query);
            const videos = result.videos.slice(0, 10);
            
            if (videos.length === 0) {
                return sock.sendMessage(chatId, { 
                    text: 'âŒ Ù„Ø§ ØªÙˆØ¬Ø¯ Ù†ØªØ§Ø¦Ø¬ Ù„Ù„Ø¨Ø­Ø«.' 
                });
            }
            
            let searchText = `âœ¨ *Ù†ØªØ§Ø¦Ø¬ Ø§Ù„Ø¨Ø­Ø« Ø¹Ù†:* ${query} âœ¨\n\n`;
            
            videos.forEach((v, index) => {
                searchText += `*${index + 1}. ðŸŽ§ ${v.title}*\n`;
                searchText += `*âŒš Ø§Ù„Ù…Ø¯Ø©:* ${v.timestamp}\n`;
                searchText += `*ðŸ‘€ Ø§Ù„Ù…Ø´Ø§Ù‡Ø¯Ø§Øª:* ${v.views.toLocaleString()}\n`;
                searchText += `*ðŸ”— Ø§Ù„Ø±Ø§Ø¨Ø·:* ${v.url}\n`;
                searchText += `â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\n`;
            });
            
            searchText += `\nðŸ”¥ *Crazy Seif BOT* | ðŸ“ž 01144534147`;
            
            await sock.sendMessage(chatId, {
                image: { url: videos[0].image },
                caption: searchText
            }, { quoted: message });
            
        } catch (error) {
            console.error('Ø®Ø·Ø£ ÙÙŠ Ø§Ù„Ø¨Ø­Ø« ÙÙŠ ÙŠÙˆØªÙŠÙˆØ¨:', error);
            await sock.sendMessage(chatId, { 
                text: 'âŒ Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø§Ù„Ø¨Ø­Ø« ÙÙŠ ÙŠÙˆØªÙŠÙˆØ¨.' 
            });
        }
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
 *****************************************************************************/

