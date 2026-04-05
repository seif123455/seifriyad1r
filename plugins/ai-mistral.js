import axios from 'axios';

const AI_APIS = [
    (q) => `https://mistral.stacktoy.workers.dev/?apikey=Suhail&text=${encodeURIComponent(q)}`,
    (q) => `https://llama.gtech-apiz.workers.dev/?apikey=Suhail&text=${encodeURIComponent(q)}`,
    (q) => `https://mistral.gtech-apiz.workers.dev/?apikey=Suhail&text=${encodeURIComponent(q)}`
];

const Ø§Ø³Ø§Ù„_Ø§Ù„Ø°ÙƒØ§Ø¡ = async (Ø§Ù„Ø³Ø¤Ø§Ù„) => {
    for (const Ø±Ø§Ø¨Ø·_Ø§Ù„api of AI_APIS) {
        try {
            const { data } = await axios.get(Ø±Ø§Ø¨Ø·_Ø§Ù„api(Ø§Ù„Ø³Ø¤Ø§Ù„), { timeout: 15000 });
            const Ø§Ù„Ø±Ø¯ = data?.data?.response;
            if (Ø§Ù„Ø±Ø¯ && typeof Ø§Ù„Ø±Ø¯ === 'string' && Ø§Ù„Ø±Ø¯.trim()) {
                return Ø§Ù„Ø±Ø¯.trim();
            }
        }
        catch {
            continue;
        }
    }
    throw new Error('Ø¬Ù…ÙŠØ¹ Ø®Ø¯Ù…Ø§Øª Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ ÙØ´Ù„Øª');
};

export default {
    command: 'Ø°ÙƒØ§Ø¡',
    aliases: ['mistral', 'ai', 'chat', 'ask', 'Ø§Ø³Ø§Ù„', 'Ø³Ø¤Ø§Ù„', 'gpt', 'llama'],
    category: 'Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ',
    description: 'Ø§Ø³Ø£Ù„ Ø³Ø¤Ø§Ù„ Ù„Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ',
    usage: '!Ø°ÙƒØ§Ø¡ <Ø§Ù„Ø³Ø¤Ø§Ù„>',
    
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const Ø§Ù„Ø³Ø¤Ø§Ù„ = args.join(' ').trim();
        
        if (!Ø§Ù„Ø³Ø¤Ø§Ù„) {
            return sock.sendMessage(chatId, { 
                text: `ðŸ¤– *Ù…Ø³Ø§Ø¹Ø¯ Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ*\n\n` +
                    `*Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…:* \`!Ø°ÙƒØ§Ø¡ <Ø³Ø¤Ø§Ù„Ùƒ>\`\n\n` +
                    `*Ø£Ù…Ø«Ù„Ø©:*\n` +
                    `â€¢ \`!Ø°ÙƒØ§Ø¡ Ù…Ø§ Ù‡ÙŠ Ø¹Ø§ØµÙ…Ø© Ù…ØµØ±ØŸ\`\n` +
                    `â€¢ \`!Ø°ÙƒØ§Ø¡ Ø§Ø´Ø±Ø­ Ù„ÙŠ Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ\`\n` +
                    `â€¢ \`!Ø°ÙƒØ§Ø¡ ÙƒÙ… Ø¹Ù…Ø±ÙƒØŸ\``
            }, { quoted: message });
        }
        
        try {
            await sock.sendMessage(chatId, { react: { text: 'ðŸ¤–', key: message.key } });
            const Ø§Ù„Ø±Ø¯ = await Ø§Ø³Ø§Ù„_Ø§Ù„Ø°ÙƒØ§Ø¡(Ø§Ù„Ø³Ø¤Ø§Ù„);
            await sock.sendMessage(chatId, { text: Ø§Ù„Ø±Ø¯ }, { quoted: message });
        } catch (error) {
            console.error('Ø®Ø·Ø£ ÙÙŠ Ø£Ù…Ø± Ø§Ù„Ø°ÙƒØ§Ø¡:', error.message);
            await sock.sendMessage(chatId, { 
                text: 'âŒ ÙØ´Ù„ Ø§Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ø±Ø¯ Ù…Ù† Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ. Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰ Ù„Ø§Ø­Ù‚Ø§Ù‹.' 
            }, { quoted: message });
        }
    }
};

