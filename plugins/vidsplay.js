import axios from 'axios';

export default {
    command: 'ÙÙŠØ¯ÙŠÙˆ',
    aliases: ['vidsplay', 'vidsplaydl', 'vidsplayvideo', 'ØªØ­Ù…ÙŠÙ„_ÙÙŠØ¯ÙŠÙˆ'],
    category: 'Ø§Ù„ØªØ­Ù…ÙŠÙ„',
    description: 'ØªØ­Ù…ÙŠÙ„ ÙÙŠØ¯ÙŠÙˆ ÙˆØµÙˆØ±Ø© Ù…ØµØºØ±Ø© Ù…Ù† ÙÙŠØ¯Ø³Ø¨Ù„Ø§ÙŠ',
    usage: '!ÙÙŠØ¯ÙŠÙˆ <Ø±Ø§Ø¨Ø· ÙÙŠØ¯Ø³Ø¨Ù„Ø§ÙŠ>',
    
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const url = args?.[0];
        
        if (!url) {
            return await sock.sendMessage(chatId, { 
                text: 'ðŸŽ¬ *ØªØ­Ù…ÙŠÙ„ ÙÙŠØ¯ÙŠÙˆ Ù…Ù† Vidsplay*\n\n' +
                    '*Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…:* `!ÙÙŠØ¯ÙŠÙˆ <Ø§Ù„Ø±Ø§Ø¨Ø·>`\n' +
                    '*Ù…Ø«Ø§Ù„:* `!ÙÙŠØ¯ÙŠÙˆ https://www.vidsplay.com/golf-free-stock-video/`' 
            }, { quoted: message });
        }
        
        try {
            const apiUrl = `https://discardapi.dpdns.org/api/dl/vidsplay?apikey=guru&url=${encodeURIComponent(url)}`;
            const { data } = await axios.get(apiUrl, { timeout: 10000 });
            
            if (!data?.status || !data.result?.length) {
                return await sock.sendMessage(chatId, { 
                    text: 'âŒ Ù„Ø§ ÙŠÙˆØ¬Ø¯ ÙÙŠØ¯ÙŠÙˆ Ù„Ù‡Ø°Ø§ Ø§Ù„Ø±Ø§Ø¨Ø·.' 
                }, { quoted: message });
            }
            
            const videoUrl = data.result[0].video;
            const imageUrl = data.result[0].image;
            
            if (imageUrl) {
                await sock.sendMessage(chatId, { 
                    image: { url: imageUrl }, 
                    caption: 'ðŸ–¼ï¸ *Ø§Ù„ØµÙˆØ±Ø© Ø§Ù„Ù…ØµØºØ±Ø©*\nðŸ”¥ Crazy Seif BOT' 
                }, { quoted: message });
            }
            
            if (videoUrl) {
                await sock.sendMessage(chatId, { 
                    video: { url: videoUrl }, 
                    caption: 'ðŸŽ¬ *Ø§Ù„ÙÙŠØ¯ÙŠÙˆ*\nðŸ”¥ Crazy Seif BOT | ðŸ“ž 01144534147' 
                }, { quoted: message });
            }
            
        } catch (error) {
            console.error('Ø®Ø·Ø£ ÙÙŠ Ø£Ù…Ø± ÙÙŠØ¯ÙŠÙˆ Vidsplay:', error);
            
            if (error.code === 'ECONNABORTED') {
                await sock.sendMessage(chatId, { 
                    text: 'âŒ Ø§Ù†ØªÙ‡Øª Ù…Ù‡Ù„Ø© Ø§Ù„Ø·Ù„Ø¨. Ù‚Ø¯ ØªÙƒÙˆÙ† ÙˆØ§Ø¬Ù‡Ø© Ø§Ù„Ø¨Ø±Ù…Ø¬Ø© Ø¨Ø·ÙŠØ¦Ø© Ø£Ùˆ Ù„Ø§ ÙŠÙ…ÙƒÙ† Ø§Ù„ÙˆØµÙˆÙ„ Ø¥Ù„ÙŠÙ‡Ø§.' 
                }, { quoted: message });
            } else {
                await sock.sendMessage(chatId, { 
                    text: 'âŒ ÙØ´Ù„ ÙÙŠ Ø¬Ù„Ø¨ Ø§Ù„ÙÙŠØ¯ÙŠÙˆ Ù…Ù† Vidsplay.' 
                }, { quoted: message });
            }
        }
    }
};

