import axios from 'axios';

export default {
    command: 'Ø®ÙŠØ±',
    aliases: ['wyr', 'wouldyourather', 'Ø§Ø®ØªØ§Ø±', 'Ø§ÙŠØ´_ØªØ®ØªØ§Ø±'],
    category: 'ØªØ³Ù„ÙŠØ©',
    description: 'Ø§Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ø³Ø¤Ø§Ù„ "Ù…Ø§Ø°Ø§ ØªÙØ¶Ù„"',
    usage: '!Ø®ÙŠØ±',
    
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        
        try {
            const res = await axios.get('https://discardapi.dpdns.org/api/quote/wyr?apikey=guru');
            
            if (!res.data || res.data.status !== true) {
                return await sock.sendMessage(chatId, { 
                    text: 'âŒ ÙØ´Ù„ ÙÙŠ Ø¬Ù„Ø¨ Ø§Ù„Ø³Ø¤Ø§Ù„.' 
                }, { quoted: message });
            }
            
            const opt1 = res.data.question?.option1 || 'Ø§Ù„Ø®ÙŠØ§Ø± Ø§Ù„Ø£ÙˆÙ„ ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯';
            const opt2 = res.data.question?.option2 || 'Ø§Ù„Ø®ÙŠØ§Ø± Ø§Ù„Ø«Ø§Ù†ÙŠ ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯';
            
            const replyText = `ðŸ¤” *Ù…Ø§Ø°Ø§ ØªÙØ¶Ù„*\n\n` +
                `â— ${opt1}\n\n` +
                `â— ${opt2}`;
            
            await sock.sendMessage(chatId, { text: replyText }, { quoted: message });
            
        } catch (err) {
            console.error('Ø®Ø·Ø£ ÙÙŠ Ø£Ù…Ø± "Ù…Ø§Ø°Ø§ ØªÙØ¶Ù„":', err);
            await sock.sendMessage(chatId, { 
                text: 'âŒ Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø¬Ù„Ø¨ Ø§Ù„Ø³Ø¤Ø§Ù„.' 
            }, { quoted: message });
        }
    }
};

