/*****************************************************************************
 *                                                                           *
 *                     Developed By Crazy Seif                               *
 *                                                                           *
 *  ðŸ“ž  WhatsApp : 01144534147                                              *
 *                                                                           *
 *    Â© 2026 Crazy Seif. All rights reserved.                               *
 *                                                                           *
 *****************************************************************************/
import axios from 'axios';

export default {
    command: 'ØªØ­Ù…ÙŠÙ„',
    aliases: ['alamy', 'alamydl', 'alamydownload', 'ØµÙˆØ±', 'ÙÙŠØ¯ÙŠÙˆ'],
    category: 'Ø§Ù„ØªØ­Ù…ÙŠÙ„',
    description: 'ØªØ­Ù…ÙŠÙ„ ØµÙˆØ±Ø© Ø£Ùˆ ÙÙŠØ¯ÙŠÙˆ Ù…Ù† Ø§Ù„Ø§Ù…ÙŠ',
    usage: '!ØªØ­Ù…ÙŠÙ„ <Ø±Ø§Ø¨Ø· Ø§Ù„Ø§Ù…ÙŠ>',
    
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const url = args?.[0]?.trim();
        
        if (!url) {
            return await sock.sendMessage(chatId, { 
                text: 'âŒ *Ø§Ù„Ø±Ø¬Ø§Ø¡ Ø¥Ø±Ø³Ø§Ù„ Ø±Ø§Ø¨Ø· Alamy*\n\n' +
                    '*Ù…Ø«Ø§Ù„:*\n' +
                    '`!ØªØ­Ù…ÙŠÙ„ https://www.alamy.com/video/beautiful-lake...`' 
            }, { quoted: message });
        }
        
        try {
            const apiUrl = `https://discardapi.dpdns.org/api/dl/alamy?apikey=guru&url=${encodeURIComponent(url)}`;
            const { data } = await axios.get(apiUrl, { timeout: 10000 });
            
            if (!data?.status || !data.result?.length) {
                return await sock.sendMessage(chatId, { 
                    text: 'âŒ ÙØ´Ù„ ÙÙŠ Ø¬Ù„Ø¨ Ø§Ù„ÙˆØ³Ø§Ø¦Ø· Ù…Ù† Ø§Ù„Ø±Ø§Ø¨Ø· Ø§Ù„Ù…Ù‚Ø¯Ù….' 
                }, { quoted: message });
            }
            
            const isValidUrl = (u) => u && u.startsWith('http');
            let sent = false;
            
            for (const item of data.result) {
                if (isValidUrl(item.video)) {
                    await sock.sendMessage(chatId, { 
                        video: { url: item.video }, 
                        caption: 'ðŸŽ¬ *ÙÙŠØ¯ÙŠÙˆ Alamy*\nðŸ”¥ Crazy Seif' 
                    }, { quoted: message });
                    sent = true;
                }
                if (isValidUrl(item.image)) {
                    await sock.sendMessage(chatId, { 
                        image: { url: item.image }, 
                        caption: 'ðŸ–¼ï¸ *ØµÙˆØ±Ø© Alamy*\nðŸ”¥ Crazy Seif' 
                    }, { quoted: message });
                    sent = true;
                }
            }
            
            if (!sent) {
                await sock.sendMessage(chatId, { 
                    text: 'âŒ Ù„Ù… ÙŠØªÙ… Ø§Ù„Ø¹Ø«ÙˆØ± Ø¹Ù„Ù‰ ÙˆØ³Ø§Ø¦Ø· ØµØ§Ù„Ø­Ø© ÙÙŠ Ø§Ù„Ø±Ø§Ø¨Ø·.' 
                }, { quoted: message });
            }
            
        } catch (error) {
            console.error('Ø®Ø·Ø£ ÙÙŠ Ø£Ù…Ø± Ø§Ù„ØªØ­Ù…ÙŠÙ„:', error);
            if (error.code === 'ECONNABORTED') {
                await sock.sendMessage(chatId, { 
                    text: 'âŒ Ø§Ù†ØªÙ‡Øª Ù…Ù‡Ù„Ø© Ø§Ù„Ø·Ù„Ø¨. Ù‚Ø¯ ØªÙƒÙˆÙ† ÙˆØ§Ø¬Ù‡Ø© Ø§Ù„Ø¨Ø±Ù…Ø¬Ø© Ø¨Ø·ÙŠØ¦Ø© Ø£Ùˆ Ù„Ø§ ÙŠÙ…ÙƒÙ† Ø§Ù„ÙˆØµÙˆÙ„ Ø¥Ù„ÙŠÙ‡Ø§.' 
                }, { quoted: message });
            } else {
                await sock.sendMessage(chatId, { 
                    text: 'âŒ ÙØ´Ù„ ØªØ­Ù…ÙŠÙ„ Ø§Ù„ÙˆØ³Ø§Ø¦Ø· Ù…Ù† Ø±Ø§Ø¨Ø· Alamy.' 
                }, { quoted: message });
            }
        }
    }
};

