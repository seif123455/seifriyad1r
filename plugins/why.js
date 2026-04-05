import axios from 'axios';

async function fetchWithRetries(url, retries = 3, delay = 2000) {
    let attempt = 0;
    while (attempt < retries) {
        try {
            const { data } = await axios.get(url);
            return data;
        } catch (err) {
            attempt++;
            console.error(`[Ù„Ù…Ø§Ø°Ø§] Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø© ${attempt} ÙØ´Ù„Øª:`, err.message);
            if (attempt >= retries) throw new Error('ØªÙ… Ø§Ù„ÙˆØµÙˆÙ„ Ù„Ù„Ø­Ø¯ Ø§Ù„Ø£Ù‚ØµÙ‰ Ù…Ù† Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø§Øª');
            await new Promise(r => setTimeout(r, delay));
        }
    }
}

export default {
    command: 'Ù„Ù…Ø§Ø°Ø§',
    aliases: ['why', 'whyme', 'question', 'Ø³Ø¤Ø§Ù„', 'Ù„ÙŠØ´'],
    category: 'ØªØ³Ù„ÙŠØ©',
    description: 'Ø§Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ø³Ø¤Ø§Ù„ "Ù„Ù…Ø§Ø°Ø§" Ø¹Ø´ÙˆØ§Ø¦ÙŠ',
    usage: '!Ù„Ù…Ø§Ø°Ø§',
    
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        
        try {
            const data = await fetchWithRetries('https://nekos.life/api/v2/why');
            
            if (!data?.why?.trim()) {
                return await sock.sendMessage(chatId, { 
                    text: 'âŒ Ø±Ø¯ ØºÙŠØ± ØµØ§Ù„Ø­ Ù…Ù† ÙˆØ§Ø¬Ù‡Ø© Ø§Ù„Ø¨Ø±Ù…Ø¬Ø©. Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.' 
                }, { quoted: message });
            }
            
            const whyText = data.why;
            
            // ØªØ±Ø¬Ù…Ø© "Why?" Ø¥Ù„Ù‰ "Ù„Ù…Ø§Ø°Ø§ØŸ" ÙÙŠ Ø¨Ø¯Ø§ÙŠØ© Ø§Ù„Ø³Ø¤Ø§Ù„
            let finalText = whyText;
            if (whyText.toLowerCase().startsWith('why')) {
                finalText = 'ðŸ¤” *Ù„Ù…Ø§Ø°Ø§ØŸ*\n\n' + whyText.replace(/^why\s*/i, '');
            } else {
                finalText = `ðŸ¤” *Ù„Ù…Ø§Ø°Ø§ØŸ*\n\n${whyText}`;
            }
            
            await sock.sendMessage(chatId, { 
                text: finalText + '\n\nðŸ”¥ *Crazy Seif BOT* | ðŸ“ž 01144534147' 
            }, { quoted: message });
            
        } catch (error) {
            console.error('Ø®Ø·Ø£ ÙÙŠ Ø£Ù…Ø± "Ù„Ù…Ø§Ø°Ø§":', error);
            await sock.sendMessage(chatId, { 
                text: 'âŒ ÙØ´Ù„ ÙÙŠ Ø¬Ù„Ø¨ Ø§Ù„Ø³Ø¤Ø§Ù„. Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰ Ù„Ø§Ø­Ù‚Ø§Ù‹.' 
            }, { quoted: message });
        }
    }
};

