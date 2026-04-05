import axios from 'axios';
import { channelInfo } from '../lib/messageConfig.js';

export default {
    command: 'Ù‡Ù„Ø§Ùƒ',
    aliases: ['wasted', 'waste', 'Ù…ÙˆØª', 'ØªØ­Ø·ÙŠÙ…'],
    category: 'ØªØ³Ù„ÙŠØ©',
    description: 'Ø¹Ù…Ù„ ØªØ£Ø«ÙŠØ± "Ù‡Ù„Ø§Ùƒ" Ø¹Ù„Ù‰ ØµÙˆØ±Ø© Ø§Ù„Ø´Ø®Øµ',
    usage: '!Ù‡Ù„Ø§Ùƒ @Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…',
    
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        let userToWaste;
        
        if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            userToWaste = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
        } else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
            userToWaste = message.message.extendedTextMessage.contextInfo.participant;
        }
        
        if (!userToWaste) {
            return await sock.sendMessage(chatId, {
                text: 'ðŸ’€ *ØªØ£Ø«ÙŠØ± Ø§Ù„Ù‡Ù„Ø§Ùƒ*\n\n' +
                    '*Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…:* `!Ù‡Ù„Ø§Ùƒ @Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…`\n' +
                    '*Ù…Ø«Ø§Ù„:* `!Ù‡Ù„Ø§Ùƒ @username`\n\n' +
                    '*Ø£Ùˆ Ø±Ø¯ Ø¹Ù„Ù‰ Ø±Ø³Ø§Ù„Ø© Ø§Ù„Ø´Ø®Øµ Ø«Ù… Ø§ÙƒØªØ¨:* `!Ù‡Ù„Ø§Ùƒ`',
                ...channelInfo
            }, { quoted: message });
        }
        
        try {
            let profilePic;
            try {
                profilePic = await sock.profilePictureUrl(userToWaste, 'image');
            } catch {
                profilePic = 'https://i.imgur.com/2wzGhpF.jpeg';
            }
            
            const wastedResponse = await axios.get(`https://some-random-api.com/canvas/overlay/wasted?avatar=${encodeURIComponent(profilePic)}`, { responseType: 'arraybuffer' });
            
            const userName = sock.store?.contacts?.[userToWaste]?.name || 
                           sock.store?.contacts?.[userToWaste]?.notify || 
                           (userToWaste.includes('@s.whatsapp.net') ? userToWaste.replace('@s.whatsapp.net', '') : 'Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…');
            
            await sock.sendMessage(chatId, {
                image: Buffer.from(wastedResponse.data),
                caption: `âš°ï¸ *Ù‡Ù„Ø§Ùƒ* : ${userName} ðŸ’€\n\n` +
                    `âŽ¯âŽ¯âŽ¯âŽ¯âŽ¯âŽ¯âŽ¯âŽ¯âŽ¯âŽ¯âŽ¯âŽ¯âŽ¯\n` +
                    `ðŸ’€ *ØªØ­Ø·Ù… Ø¥Ù„Ù‰ Ø£Ø¬Ø²Ø§Ø¡!*\n` +
                    `ðŸ”¥ *Crazy Seif BOT* | ðŸ“ž 01144534147`,
                mentions: [userToWaste],
                ...channelInfo
            }, { quoted: message });
            
        } catch (error) {
            console.error('Ø®Ø·Ø£ ÙÙŠ Ø£Ù…Ø± Ø§Ù„Ù‡Ù„Ø§Ùƒ:', error);
            await sock.sendMessage(chatId, {
                text: 'âŒ ÙØ´Ù„ ÙÙŠ Ø¥Ù†Ø´Ø§Ø¡ ØµÙˆØ±Ø© Ø§Ù„Ù‡Ù„Ø§Ùƒ! Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰ Ù„Ø§Ø­Ù‚Ø§Ù‹.',
                ...channelInfo
            }, { quoted: message });
        }
    }
};

