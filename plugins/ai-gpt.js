import axios from 'axios';

const AI_APIS = [
    (q) => `https://mistral.stacktoy.workers.dev/?apikey=Suhail&text=${encodeURIComponent(q)}`,
    (q) => `https://llama.gtech-apiz.workers.dev/?apikey=Suhail&text=${encodeURIComponent(q)}`,
    (q) => `https://mistral.gtech-apiz.workers.dev/?apikey=Suhail&text=${encodeURIComponent(q)}`
];

const Ø§Ø³Ø£Ù„_Ø§Ù„Ø°ÙƒØ§Ø¡ = async (Ø§Ù„Ø³Ø¤Ø§Ù„) => {
    for (const Ø±Ø§Ø¨Ø·_Ø§Ù„api of AI_APIS) {
        try {
            const { data } = await axios.get(Ø±Ø§Ø¨Ø·_Ø§Ù„api(Ø§Ù„Ø³Ø¤Ø§Ù„), { timeout: 15000 });
            const Ø§Ù„Ø±Ø¯ = data?.data?.response;
            if (Ø§Ù„Ø±Ø¯ && typeof Ø§Ù„Ø±Ø¯ === 'string' && Ø§Ù„Ø±Ø¯.trim()) {
                return Ø§Ù„Ø±Ø¯.trim();
            }
        } catch {
            continue;
        }
    }
    throw new Error('ÙØ´Ù„Øª Ø¬Ù…ÙŠØ¹ Ø®Ø¯Ù…Ø§Øª Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ');
};

export default {
    command: 'Ø§Ø³Ø£Ù„',
    aliases: ['Ø°ÙƒØ§Ø¡', 'Ø³Ø¤Ø§Ù„'],
    category: 'Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ',
    description: 'Ø§Ø·Ø±Ø­ Ø£ÙŠ Ø³Ø¤Ø§Ù„ Ø¹Ù„Ù‰ Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ',
    usage: '!Ø§Ø³Ø£Ù„ <Ø³Ø¤Ø§Ù„Ùƒ>',
    
    async handler(sock, message, args, context) {
        const Ù…Ø¹Ø±Ù_Ø§Ù„Ù…Ø­Ø§Ø¯Ø«Ø© = context.chatId || message.key.remoteJid;
        const Ø§Ù„Ø³Ø¤Ø§Ù„ = args.join(' ').trim();
        
        if (!Ø§Ù„Ø³Ø¤Ø§Ù„) {
            return sock.sendMessage(Ù…Ø¹Ø±Ù_Ø§Ù„Ù…Ø­Ø§Ø¯Ø«Ø©, { 
                text:
`ðŸ¤– *Ù…Ø³Ø§Ø¹Ø¯ Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ*

ðŸ“Œ *Ø·Ø±ÙŠÙ‚Ø© Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…:*
!Ø§Ø³Ø£Ù„ <Ø³Ø¤Ø§Ù„Ùƒ>

ðŸ“ *Ø£Ù…Ø«Ù„Ø©:*
â€¢ !Ø§Ø³Ø£Ù„ Ù…Ø§ Ù‡ÙŠ Ø¹Ø§ØµÙ…Ø© Ù…ØµØ±ØŸ
â€¢ !Ø§Ø³Ø£Ù„ Ø§Ø´Ø±Ø­ Ù„ÙŠ Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ
â€¢ !Ø§Ø³Ø£Ù„ ÙƒÙ… Ø¹Ù…Ø±ÙƒØŸ`
            }, { quoted: message });
        }
        
        try {
            await sock.sendMessage(Ù…Ø¹Ø±Ù_Ø§Ù„Ù…Ø­Ø§Ø¯Ø«Ø©, { 
                react: { text: 'ðŸ¤–', key: message.key } 
            });

            const Ø§Ù„Ø±Ø¯ = await Ø§Ø³Ø£Ù„_Ø§Ù„Ø°ÙƒØ§Ø¡(Ø§Ù„Ø³Ø¤Ø§Ù„);

            await sock.sendMessage(Ù…Ø¹Ø±Ù_Ø§Ù„Ù…Ø­Ø§Ø¯Ø«Ø©, { 
                text: `ðŸ¤– *Ø§Ù„Ø±Ø¯:*\n\n${Ø§Ù„Ø±Ø¯}` 
            }, { quoted: message });

        } catch (error) {
            console.error('Ø®Ø·Ø£ ÙÙŠ Ø£Ù…Ø± Ø§Ù„Ø°ÙƒØ§Ø¡:', error.message);
            await sock.sendMessage(Ù…Ø¹Ø±Ù_Ø§Ù„Ù…Ø­Ø§Ø¯Ø«Ø©, { 
                text: 'âŒ Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø¬Ù„Ø¨ Ø§Ù„Ø±Ø¯ Ù…Ù† Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠØŒ Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰ Ù„Ø§Ø­Ù‚Ù‹Ø§.' 
            }, { quoted: message });
        }
    }
};

