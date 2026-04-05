/*****************************************************************************
 *                                                                           *
 *                     Developed By Crazy Seif                               *
 *                                                                           *
 *  ðŸ“ž  WhatsApp : 01144534147                                              *
 *                                                                           *
 *    Â© 2026 Crazy Seif. All rights reserved.                               *
 *                                                                           *
 *****************************************************************************/
import axios from 'axios';

export default {
    command: 'ØªÙˆÙŠØªØ±',
    aliases: ['xstalk', 'twstalk', 'xprofile', 'ØªÙˆÙŠØªØ±_Ù…Ø¹Ù„ÙˆÙ…Ø§Øª', 'ØªÙˆÙŠØªØ±_Ø¨Ø±ÙˆÙØ§ÙŠÙ„'],
    category: 'stalk',
    description: 'Ø¬Ù„Ø¨ Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø¨Ø±ÙˆÙØ§ÙŠÙ„ Ù…Ø³ØªØ®Ø¯Ù… ØªÙˆÙŠØªØ±',
    usage: '!ØªÙˆÙŠØªØ± <Ø§Ø³Ù…_Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…>',
    
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        
        if (!args.length) {
            return await sock.sendMessage(chatId, {
                text: 'ðŸ¦ *Ø¬Ù„Ø¨ Ù…Ø¹Ù„ÙˆÙ…Ø§Øª ØªÙˆÙŠØªØ±*\n\n' +
                    '*Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…:* `!ØªÙˆÙŠØªØ± <Ø§Ø³Ù…_Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…>`\n' +
                    '*Ù…Ø«Ø§Ù„:* `!ØªÙˆÙŠØªØ± ElonMusk`'
            }, { quoted: message });
        }
        
        const username = args[0];
        
        try {
            const { data } = await axios.get(`https://discardapi.dpdns.org/api/stalk/twitter`, {
                params: { apikey: 'guru', username }
            });
            
            if (!data?.result) {
                return await sock.sendMessage(chatId, { 
                    text: 'âŒ Ù…Ø³ØªØ®Ø¯Ù… ØªÙˆÙŠØªØ± ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯.' 
                }, { quoted: message });
            }
            
            const result = data.result;
            const profileImage = result.profile?.image || null;
            const bannerImage = result.profile?.banner || null;
            const verifiedMark = result.verified ? 'âœ… Ù…ÙˆØ«Ù‚' : '';
            
            const caption = `ðŸ¦ *Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø¨Ø±ÙˆÙØ§ÙŠÙ„ ØªÙˆÙŠØªØ±*\n\n` +
                `ðŸ‘¤ Ø§Ù„Ø§Ø³Ù…: ${result.name || 'ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙ'} ${verifiedMark}\n` +
                `ðŸ†” Ø§Ø³Ù… Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…: @${result.username || 'ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙ'}\n` +
                `ðŸ“ Ø§Ù„Ø³ÙŠØ±Ø© Ø§Ù„Ø°Ø§ØªÙŠØ©: ${result.description || 'Ù„Ø§ ÙŠÙˆØ¬Ø¯'}\n` +
                `ðŸ“ Ø§Ù„Ù…ÙˆÙ‚Ø¹: ${result.location || 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯'}\n` +
                `ðŸ“… ØªØ§Ø±ÙŠØ® Ø§Ù„Ø§Ù†Ø¶Ù…Ø§Ù…: ${new Date(result.created_at).toLocaleDateString('ar-EG')}\n\n` +
                `ðŸ‘¥ Ø§Ù„Ù…ØªØ§Ø¨Ø¹ÙˆÙ†: ${result.stats?.followers?.toLocaleString() || 0}\n` +
                `âž¡ ÙŠØªØ§Ø¨Ø¹: ${result.stats?.following?.toLocaleString() || 0}\n` +
                `â¤ï¸ Ø§Ù„Ø¥Ø¹Ø¬Ø§Ø¨Ø§Øª: ${result.stats?.likes?.toLocaleString() || 0}\n` +
                `ðŸ–¼ Ø§Ù„ÙˆØ³Ø§Ø¦Ø·: ${result.stats?.media?.toLocaleString() || 0}\n` +
                `ðŸ¦ Ø§Ù„ØªØºØ±ÙŠØ¯Ø§Øª: ${result.stats?.tweets?.toLocaleString() || 0}\n` +
                `ðŸ”— Ø±Ø§Ø¨Ø· Ø§Ù„Ø¨Ø±ÙˆÙØ§ÙŠÙ„: https://twitter.com/${result.username}\n\n` +
                `ðŸ”¥ *Crazy Seif BOT* | ðŸ“ž 01144534147`;
            
            if (profileImage) {
                await sock.sendMessage(chatId, { 
                    image: { url: profileImage }, 
                    caption 
                }, { quoted: message });
            } else {
                await sock.sendMessage(chatId, { text: caption }, { quoted: message });
            }
            
            if (bannerImage) {
                await sock.sendMessage(chatId, { 
                    image: { url: bannerImage }, 
                    caption: `ðŸ“Œ ØµÙˆØ±Ø© Ø§Ù„ØºÙ„Ø§Ù Ù„Ù€ @${username}` 
                });
            }
            
        } catch (err) {
            console.error('Ø®Ø·Ø£ ÙÙŠ Ø£Ù…Ø± ØªÙˆÙŠØªØ±:', err);
            await sock.sendMessage(chatId, { 
                text: 'âŒ ÙØ´Ù„ ÙÙŠ Ø¬Ù„Ø¨ Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø¨Ø±ÙˆÙØ§ÙŠÙ„ ØªÙˆÙŠØªØ±.' 
            }, { quoted: message });
        }
    }
};

/*****************************************************************************
 *                                                                           *
 *                     Developed By Crazy Seif                               *
 *                                                                           *
 *  ðŸ“ž  WhatsApp : 01144534147                                              *
 *                                                                           *
 *    Â© 2026 Crazy Seif. All rights reserved.                               *
 *                                                                           *
 *****************************************************************************/

