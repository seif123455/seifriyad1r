import axios from 'axios';

export default {
    command: 'Ù…Ù†',
    aliases: ['whois', 'domaininfo', 'Ù…Ø¹Ù„ÙˆÙ…Ø§Øª_Ø§Ù„Ù†Ø·Ø§Ù‚', 'Ù†Ø·Ø§Ù‚'],
    category: 'Ù…Ø¹Ù„ÙˆÙ…Ø§Øª',
    description: 'Ø§Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ù…Ø¹Ù„ÙˆÙ…Ø§Øª ÙˆÙ‡ÙˆÙŠØ³ Ù„Ù„Ù†Ø·Ø§Ù‚',
    usage: '!Ù…Ù† <Ø§Ù„Ù†Ø·Ø§Ù‚>',
    
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        let domain = args?.[0]?.trim();
        
        if (!domain) {
            return await sock.sendMessage(chatId, { 
                text: 'ðŸŒ *Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„Ù†Ø·Ø§Ù‚ (WHOIS)*\n\n' +
                    '*Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…:* `!Ù…Ù† <Ø§Ù„Ù†Ø·Ø§Ù‚>`\n' +
                    '*Ù…Ø«Ø§Ù„:* `!Ù…Ù† google.com`\n' +
                    '*Ù…Ø«Ø§Ù„:* `!Ù…Ù† youtube.com`' 
            }, { quoted: message });
        }
        
        domain = domain.replace(/^https?:\/\//i, '');
        
        try {
            if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain)) {
                return await sock.sendMessage(chatId, { 
                    text: 'âŒ Ø§Ù„Ù†Ø·Ø§Ù‚ ØºÙŠØ± ØµØ§Ù„Ø­.' 
                }, { quoted: message });
            }
            
            const apiUrl = `https://discardapi.dpdns.org/api/tools/whois?apikey=guru&domain=${encodeURIComponent(domain)}`;
            const { data } = await axios.get(apiUrl, { timeout: 10000 });
            
            if (!data?.status || !data.result?.domain) {
                return await sock.sendMessage(chatId, { 
                    text: 'âŒ Ù„Ø§ ÙŠÙ…ÙƒÙ† Ø¬Ù„Ø¨ Ù…Ø¹Ù„ÙˆÙ…Ø§Øª WHOIS Ù„Ù„Ù†Ø·Ø§Ù‚.' 
                }, { quoted: message });
            }
            
            const { domain: dom, registrar, registrant, technical } = data.result;
            
            const text = `ðŸŒ *Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„Ù†Ø·Ø§Ù‚ (WHOIS)*\n\n` +
                `â”â”â”â”â”â” ðŸ“‹ Ø§Ù„Ù†Ø·Ø§Ù‚ â”â”â”â”â”â”\n` +
                `â€¢ Ø§Ù„Ù†Ø·Ø§Ù‚: ${dom.domain}\n` +
                `â€¢ Ø§Ù„Ø§Ø³Ù…: ${dom.name}\n` +
                `â€¢ Ø§Ù„Ø§Ù…ØªØ¯Ø§Ø¯: .${dom.extension}\n` +
                `â€¢ Ø®Ø§Ø¯Ù… WHOIS: ${dom.whois_server}\n` +
                `â€¢ Ø§Ù„Ø­Ø§Ù„Ø©: ${dom.status?.join(', ') || 'ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙ'}\n` +
                `â€¢ Ø®ÙˆØ§Ø¯Ù… Ø§Ù„Ø£Ø³Ù…Ø§Ø¡: ${dom.name_servers?.join(', ') || 'ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙ'}\n` +
                `â€¢ ØªØ§Ø±ÙŠØ® Ø§Ù„Ø¥Ù†Ø´Ø§Ø¡: ${dom.created_date_in_time || 'ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙ'}\n` +
                `â€¢ Ø¢Ø®Ø± ØªØ­Ø¯ÙŠØ«: ${dom.updated_date_in_time || 'ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙ'}\n` +
                `â€¢ ØªØ§Ø±ÙŠØ® Ø§Ù„Ø§Ù†ØªÙ‡Ø§Ø¡: ${dom.expiration_date_in_time || 'ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙ'}\n\n` +
                `â”â”â”â”â”â” ðŸ¢ Ø§Ù„Ù…Ø³Ø¬Ù„ â”â”â”â”â”â”\n` +
                `â€¢ Ø§Ù„Ø§Ø³Ù…: ${registrar?.name || 'ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙ'}\n` +
                `â€¢ Ø§Ù„Ù‡Ø§ØªÙ: ${registrar?.phone || 'ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙ'}\n` +
                `â€¢ Ø§Ù„Ø¨Ø±ÙŠØ¯: ${registrar?.email || 'ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙ'}\n` +
                `â€¢ Ø§Ù„Ù…ÙˆÙ‚Ø¹: ${registrar?.referral_url || 'ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙ'}\n\n` +
                `â”â”â”â”â”â” ðŸ‘¤ Ø§Ù„Ù…Ø§Ù„Ùƒ â”â”â”â”â”â”\n` +
                `â€¢ Ø§Ù„Ù…Ù†Ø¸Ù…Ø©: ${registrant?.organization || 'ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙ'}\n` +
                `â€¢ Ø§Ù„Ø¯ÙˆÙ„Ø©: ${registrant?.country || 'ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙ'}\n` +
                `â€¢ Ø§Ù„Ø¨Ø±ÙŠØ¯: ${registrant?.email || 'ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙ'}\n\n` +
                `â”â”â”â”â”â” âš™ ØªÙ‚Ù†ÙŠ â”â”â”â”â”â”\n` +
                `â€¢ Ø§Ù„Ø¨Ø±ÙŠØ¯: ${technical?.email || 'ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙ'}\n\n` +
                `ðŸ”¥ *Crazy Seif BOT* | ðŸ“ž 01144534147`;
            
            await sock.sendMessage(chatId, { text }, { quoted: message });
            
        } catch (error) {
            console.error('Ø®Ø·Ø£ ÙÙŠ Ø£Ù…Ø± Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„Ù†Ø·Ø§Ù‚:', error);
            
            if (error.code === 'ECONNABORTED') {
                await sock.sendMessage(chatId, { 
                    text: 'âŒ Ø§Ù†ØªÙ‡Øª Ù…Ù‡Ù„Ø© Ø§Ù„Ø·Ù„Ø¨. Ù‚Ø¯ ØªÙƒÙˆÙ† ÙˆØ§Ø¬Ù‡Ø© Ø§Ù„Ø¨Ø±Ù…Ø¬Ø© Ø¨Ø·ÙŠØ¦Ø© Ø£Ùˆ Ù„Ø§ ÙŠÙ…ÙƒÙ† Ø§Ù„ÙˆØµÙˆÙ„ Ø¥Ù„ÙŠÙ‡Ø§.' 
                }, { quoted: message });
            } else {
                await sock.sendMessage(chatId, { 
                    text: 'âŒ ÙØ´Ù„ ÙÙŠ Ø¬Ù„Ø¨ Ù…Ø¹Ù„ÙˆÙ…Ø§Øª WHOIS Ù„Ù„Ù†Ø·Ø§Ù‚.' 
                }, { quoted: message });
            }
        }
    }
};

