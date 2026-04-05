import axios from 'axios';
import { channelInfo } from '../lib/messageConfig.js';

export default {
    command: 'ÙˆÙŠÙƒÙŠØ¨ÙŠØ¯ÙŠØ§',
    aliases: ['wiki', 'wikipedia', 'Ù…ÙˆØ³ÙˆØ¹Ø©', 'Ø¨Ø­Ø«_ÙˆÙŠÙƒÙŠ'],
    category: 'Ø§Ù„Ø¨Ø­Ø«',
    description: 'Ø§Ù„Ø¨Ø­Ø« ÙÙŠ Ù…ÙˆØ³ÙˆØ¹Ø© ÙˆÙŠÙƒÙŠØ¨ÙŠØ¯ÙŠØ§',
    usage: '!ÙˆÙŠÙƒÙŠØ¨ÙŠØ¯ÙŠØ§ <Ù†Øµ Ø§Ù„Ø¨Ø­Ø«>',
    
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const query = args.join(' ').trim();
        
        if (!query) {
            return await sock.sendMessage(chatId, {
                text: "ðŸ“š *Ø§Ù„Ø¨Ø­Ø« ÙÙŠ ÙˆÙŠÙƒÙŠØ¨ÙŠØ¯ÙŠØ§*\n\n" +
                    "*Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…:* `!ÙˆÙŠÙƒÙŠØ¨ÙŠØ¯ÙŠØ§ <Ù†Øµ Ø§Ù„Ø¨Ø­Ø«>`\n" +
                    "*Ù…Ø«Ø§Ù„:* `!ÙˆÙŠÙƒÙŠØ¨ÙŠØ¯ÙŠØ§ Ù…ØµØ±`\n" +
                    "*Ù…Ø«Ø§Ù„:* `!ÙˆÙŠÙƒÙŠØ¨ÙŠØ¯ÙŠØ§ Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ`",
                ...channelInfo
            }, { quoted: message });
        }
        
        const formattedQuery = query.replace(/ /g, "_");
        
        try {
            const res = await axios.get(`https://ar.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(formattedQuery)}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Crazy Seif-BOT/1.0',
                    'Accept-Language': 'ar'
                }
            });
            
            const data = res.data;
            
            if (data.extract) {
                let resultText = `ðŸ“š *ÙˆÙŠÙƒÙŠØ¨ÙŠØ¯ÙŠØ§*\n\n` +
                    `ðŸ” *Ø§Ù„Ø¨Ø­Ø«:* ${data.title}\n\n` +
                    `ðŸ“ *Ø§Ù„Ù…Ù„Ø®Øµ:*\n${data.extract}\n\n` +
                    `ðŸ”— *Ù„Ù„Ù…Ø²ÙŠØ¯:* ${data.content_urls?.desktop?.page || 'https://ar.wikipedia.org'}\n\n` +
                    `ðŸ”¥ *Crazy Seif BOT* | ðŸ“ž 01144534147`;
                
                // Ù„Ùˆ ÙÙŠ ØµÙˆØ±Ø© Ù„Ù„ØµÙØ­Ø©
                if (data.thumbnail?.source) {
                    await sock.sendMessage(chatId, {
                        image: { url: data.thumbnail.source },
                        caption: resultText,
                        ...channelInfo
                    }, { quoted: message });
                } else {
                    await sock.sendMessage(chatId, {
                        text: resultText,
                        ...channelInfo
                    }, { quoted: message });
                }
            } else {
                await sock.sendMessage(chatId, {
                    text: "âš ï¸ Ù„Ø§ ØªÙˆØ¬Ø¯ Ù†ØªØ§Ø¦Ø¬ Ù„Ù„Ø¨Ø­Ø«. Ø­Ø§ÙˆÙ„ Ø¨ÙƒÙ„Ù…Ø§Øª Ù…Ø®ØªÙ„ÙØ©.",
                    ...channelInfo
                }, { quoted: message });
            }
            
        } catch (e) {
            console.error('Ø®Ø·Ø£ ÙÙŠ Ø£Ù…Ø± ÙˆÙŠÙƒÙŠØ¨ÙŠØ¯ÙŠØ§:', e.message || e);
            
            // Ø­Ø§ÙˆÙ„ Ø§Ù„Ø¨Ø­Ø« Ø¨Ø§Ù„Ø§Ù†Ø¬Ù„ÙŠØ²ÙŠ Ù„Ùˆ Ø§Ù„Ø¹Ø±Ø¨ÙŠ ÙØ´Ù„
            try {
                const englishQuery = query.replace(/ /g, "_");
                const resEn = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(englishQuery)}`, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Crazy Seif-BOT/1.0',
                        'Accept-Language': 'en'
                    }
                });
                
                const dataEn = resEn.data;
                
                if (dataEn.extract) {
                    let resultText = `ðŸ“š *Wikipedia*\n\n` +
                        `ðŸ” *Search:* ${dataEn.title}\n\n` +
                        `ðŸ“ *Summary:*\n${dataEn.extract}\n\n` +
                        `ðŸ”— *Read more:* ${dataEn.content_urls?.desktop?.page}\n\n` +
                        `ðŸ”¥ *Crazy Seif BOT* | ðŸ“ž 01144534147`;
                    
                    if (dataEn.thumbnail?.source) {
                        await sock.sendMessage(chatId, {
                            image: { url: dataEn.thumbnail.source },
                            caption: resultText,
                            ...channelInfo
                        }, { quoted: message });
                    } else {
                        await sock.sendMessage(chatId, {
                            text: resultText,
                            ...channelInfo
                        }, { quoted: message });
                    }
                } else {
                    await sock.sendMessage(chatId, {
                        text: "âš ï¸ Ù„Ø§ ØªÙˆØ¬Ø¯ Ù†ØªØ§Ø¦Ø¬ Ù„Ù„Ø¨Ø­Ø«. Ø­Ø§ÙˆÙ„ Ø¨ÙƒÙ„Ù…Ø§Øª Ù…Ø®ØªÙ„ÙØ©.",
                        ...channelInfo
                    }, { quoted: message });
                }
            } catch (e2) {
                await sock.sendMessage(chatId, {
                    text: "âš ï¸ Ù„Ø§ ØªÙˆØ¬Ø¯ Ù†ØªØ§Ø¦Ø¬ Ù„Ù„Ø¨Ø­Ø« Ø£Ùˆ ÙˆÙŠÙƒÙŠØ¨ÙŠØ¯ÙŠØ§ Ø­Ø¸Ø±Øª Ø§Ù„Ø·Ù„Ø¨.",
                    ...channelInfo
                }, { quoted: message });
            }
        }
    }
};

