import axios from 'axios';
import { channelInfo } from '../lib/messageConfig.js';

export default {
    command: 'Ø·Ù‚Ø³',
    aliases: ['weather', 'forecast', 'climate', 'Ø­Ø§Ù„Ø©_Ø§Ù„Ø·Ù‚Ø³', 'Ø¬Ùˆ'],
    category: 'Ù…Ø¹Ù„ÙˆÙ…Ø§Øª',
    description: 'Ø§Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ø­Ø§Ù„Ø© Ø§Ù„Ø·Ù‚Ø³ Ø§Ù„Ø­Ø§Ù„ÙŠØ© Ù„Ù…Ø¯ÙŠÙ†Ø© Ù…Ø¹ÙŠÙ†Ø©',
    usage: '!Ø·Ù‚Ø³ <Ø§Ù„Ù…Ø¯ÙŠÙ†Ø©>',
    
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const city = args.join(' ').trim();
        
        if (!city) {
            return await sock.sendMessage(chatId, {
                text: "ðŸŒ¤ï¸ *Ø­Ø§Ù„Ø© Ø§Ù„Ø·Ù‚Ø³*\n\n" +
                    "*Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…:* `!Ø·Ù‚Ø³ <Ø§Ø³Ù… Ø§Ù„Ù…Ø¯ÙŠÙ†Ø©>`\n" +
                    "*Ù…Ø«Ø§Ù„:* `!Ø·Ù‚Ø³ Ø§Ù„Ù‚Ø§Ù‡Ø±Ø©`\n" +
                    "*Ù…Ø«Ø§Ù„:* `!Ø·Ù‚Ø³ Ø¯Ø¨ÙŠ`\n" +
                    "*Ù…Ø«Ø§Ù„:* `!Ø·Ù‚Ø³ Ù„Ù†Ø¯Ù†`",
                ...channelInfo
            }, { quoted: message });
        }
        
        try {
            const apiKey = '060a6bcfa19809c2cd4d97a212b19273';
            const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`);
            const weather = response.data;
            
            // ØªØ±Ø¬Ù…Ø© ÙˆØµÙ Ø§Ù„Ø·Ù‚Ø³
            const weatherDesc = {
                'clear sky': 'Ø³Ù…Ø§Ø¡ ØµØ§ÙÙŠØ©',
                'few clouds': 'Ù‚Ù„ÙŠÙ„ Ù…Ù† Ø§Ù„ØºÙŠÙˆÙ…',
                'scattered clouds': 'ØºÙŠÙˆÙ… Ù…ØªÙØ±Ù‚Ø©',
                'broken clouds': 'ØºÙŠÙˆÙ… Ù…ØªÙƒØ³Ø±Ø©',
                'overcast clouds': 'ØºÙŠÙˆÙ… ÙƒØ«ÙŠÙØ©',
                'light rain': 'Ù…Ø·Ø± Ø®ÙÙŠÙ',
                'moderate rain': 'Ù…Ø·Ø± Ù…ØªÙˆØ³Ø·',
                'heavy rain': 'Ù…Ø·Ø± ØºØ²ÙŠØ±',
                'thunderstorm': 'Ø¹Ø§ØµÙØ© Ø±Ø¹Ø¯ÙŠØ©',
                'snow': 'Ø«Ù„Ø¬',
                'mist': 'Ø¶Ø¨Ø§Ø¨',
                'fog': 'Ø¶Ø¨Ø§Ø¨ ÙƒØ«ÙŠÙ'
            };
            
            let description = weather.weather[0].description;
            const arabicDesc = weatherDesc[description.toLowerCase()] || description;
            
            const weatherText = `ðŸŒ¤ï¸ *Ø­Ø§Ù„Ø© Ø§Ù„Ø·Ù‚Ø³*\n\n` +
                `â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”“\n` +
                `â”ƒ ðŸŒ *Ø§Ù„Ù…Ø¯ÙŠÙ†Ø©:* ${weather.name}\n` +
                `â”ƒ ðŸ—ºï¸ *Ø§Ù„Ø¯ÙˆÙ„Ø©:* ${weather.sys.country}\n` +
                `â”ƒ ðŸŒ¥ï¸ *Ø§Ù„Ø­Ø§Ù„Ø©:* ${arabicDesc}\n` +
                `â”£â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”«\n` +
                `â”ƒ ðŸŒ¡ï¸ *Ø§Ù„Ø­Ø±Ø§Ø±Ø©:* ${weather.main.temp}Â°C\n` +
                `â”ƒ ðŸ”¥ *Ø§Ù„Ø­Ø±Ø§Ø±Ø© Ø§Ù„Ø¹Ø¸Ù…Ù‰:* ${weather.main.temp_max}Â°C\n` +
                `â”ƒ ðŸ’§ *Ø§Ù„Ø­Ø±Ø§Ø±Ø© Ø§Ù„ØµØºØ±Ù‰:* ${weather.main.temp_min}Â°C\n` +
                `â”ƒ ðŸ’¦ *Ø§Ù„Ø±Ø·ÙˆØ¨Ø©:* ${weather.main.humidity}%\n` +
                `â”ƒ ðŸŒ¬ï¸ *Ø³Ø±Ø¹Ø© Ø§Ù„Ø±ÙŠØ§Ø­:* ${weather.wind.speed} ÙƒÙ…/Ø³\n` +
                `â”—â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”›\n\n` +
                `ðŸ”¥ *Crazy Seif BOT* | ðŸ“ž 01144534147`;
            
            await sock.sendMessage(chatId, {
                text: weatherText,
                ...channelInfo
            }, { quoted: message });
            
        } catch (error) {
            console.error('Ø®Ø·Ø£ ÙÙŠ Ø£Ù…Ø± Ø§Ù„Ø·Ù‚Ø³:', error);
            await sock.sendMessage(chatId, {
                text: 'âŒ Ø¹Ø°Ø±Ø§Ù‹ØŒ Ù„Ù… Ø£ØªÙ…ÙƒÙ† Ù…Ù† Ø¬Ù„Ø¨ Ø­Ø§Ù„Ø© Ø§Ù„Ø·Ù‚Ø³. ØªØ£ÙƒØ¯ Ù…Ù† ØµØ­Ø© Ø§Ø³Ù… Ø§Ù„Ù…Ø¯ÙŠÙ†Ø©.',
                ...channelInfo
            }, { quoted: message });
        }
    }
};

