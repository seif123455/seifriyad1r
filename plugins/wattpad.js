import pkg from 'api-qasim';
const QasimAny = pkg;
import { channelInfo } from '../lib/messageConfig.js';

export default {
    command: 'Ù‚ØµØµ',
    aliases: ['wattpad', 'wattpadsearch', 'searchwattpad', 'Ø±ÙˆØ§ÙŠØ§Øª', 'Ø¨Ø­Ø«_Ù‚ØµØµ'],
    category: 'Ø§Ù„Ø¨Ø­Ø«',
    description: 'Ø§Ù„Ø¨Ø­Ø« Ø¹Ù† Ù‚ØµØµ ÙÙŠ ÙˆØ§ØªØ¨Ø§Ø¯',
    usage: '!Ù‚ØµØµ <Ù†Øµ Ø§Ù„Ø¨Ø­Ø«>',
    
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const query = args.join(' ').trim();
        
        if (!query) {
            return await sock.sendMessage(chatId, {
                text: 'ðŸ“š *Ø§Ù„Ø¨Ø­Ø« ÙÙŠ ÙˆØ§ØªØ¨Ø§Ø¯*\n\n' +
                    '*Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…:* `!Ù‚ØµØµ <Ù†Øµ Ø§Ù„Ø¨Ø­Ø«>`\n' +
                    '*Ù…Ø«Ø§Ù„:* `!Ù‚ØµØµ Ø­Ø¨`\n' +
                    '*Ù…Ø«Ø§Ù„:* `!Ù‚ØµØµ Ø±Ø¹Ø¨`\n' +
                    '*Ù…Ø«Ø§Ù„:* `!Ù‚ØµØµ Ù…ØºØ§Ù…Ø±Ø§Øª`',
                ...channelInfo
            }, { quoted: message });
        }
        
        try {
            const results = await QasimAny.wattpad(query);
            
            if (!Array.isArray(results) || results.length === 0) {
                throw new Error('Ù„Ø§ ØªÙˆØ¬Ø¯ Ù†ØªØ§Ø¦Ø¬ Ù„Ù„Ø¨Ø­Ø«.');
            }
            
            const formattedResults = results.slice(0, 9).map((story, index) => {
                const title = story.judul || 'Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ø¹Ù†ÙˆØ§Ù†';
                const reads = story.dibaca || 'ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙ';
                const votes = story.divote || 'ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙ';
                const thumb = story.thumb || '';
                const link = story.link || 'Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ø±Ø§Ø¨Ø·';
                
                return `${index + 1}. ðŸ“– *${title}*\n` +
                       `   ðŸ‘ï¸ *Ø§Ù„Ù…Ø´Ø§Ù‡Ø¯Ø§Øª:* ${reads}\n` +
                       `   ðŸ‘ *Ø§Ù„ØªØµÙˆÙŠØªØ§Øª:* ${votes}\n` +
                       `   ðŸ”— *Ø§Ù„Ø±Ø§Ø¨Ø·:* ${link}`;
            }).join('\n\n');
            
            await sock.sendMessage(chatId, {
                text: `ðŸ“š *Ù†ØªØ§Ø¦Ø¬ Ø§Ù„Ø¨Ø­Ø« Ø¹Ù†:* "${query}"\n\n${formattedResults}\n\nðŸ”¥ *Crazy Seif BOT* | ðŸ“ž 01144534147`,
                ...channelInfo
            }, { quoted: message });
            
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `âŒ Ø­Ø¯Ø« Ø®Ø·Ø£: ${error.message || error}`,
                ...channelInfo
            }, { quoted: message });
        }
    }
};

