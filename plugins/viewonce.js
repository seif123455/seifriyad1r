import { downloadContentFromMessage } from '@whiskeysockets/baileys';

export default {
    command: 'Ù…Ø±Ø©',
    aliases: ['viewonce', 'viewmedia', 'vv', 'Ù…Ø±Ø©_ÙˆØ§Ø­Ø¯Ø©', 'ØµÙˆØ±Ø©_Ù…Ø±Ø©'],
    category: 'Ø¹Ø§Ù…',
    description: 'Ø¥Ø¹Ø§Ø¯Ø© Ø¥Ø±Ø³Ø§Ù„ ØµÙˆØ±Ø© Ø£Ùˆ ÙÙŠØ¯ÙŠÙˆ ÙŠÙØ±Ù‰ Ù…Ø±Ø© ÙˆØ§Ø­Ø¯Ø©',
    usage: '!Ù…Ø±Ø© (Ø±Ø¯ Ø¹Ù„Ù‰ ÙˆØ³Ø§Ø¦Ø· ØªÙØ±Ù‰ Ù…Ø±Ø© ÙˆØ§Ø­Ø¯Ø©)',
    
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        
        try {
            const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const quotedImage = quoted?.imageMessage;
            const quotedVideo = quoted?.videoMessage;
            
            if (quotedImage && quotedImage.viewOnce) {
                const stream = await downloadContentFromMessage(quotedImage, 'image');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
                
                await sock.sendMessage(chatId, {
                    image: buffer,
                    fileName: 'media.jpg',
                    caption: quotedImage.caption || 'ðŸ“¸ *ØµÙˆØ±Ø© ÙƒØ§Ù†Øª ØªÙØ±Ù‰ Ù…Ø±Ø© ÙˆØ§Ø­Ø¯Ø©*\nðŸ”¥ Crazy Seif BOT'
                }, { quoted: message });
                
            } else if (quotedVideo && quotedVideo.viewOnce) {
                const stream = await downloadContentFromMessage(quotedVideo, 'video');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
                
                await sock.sendMessage(chatId, {
                    video: buffer,
                    fileName: 'media.mp4',
                    caption: quotedVideo.caption || 'ðŸŽ¬ *ÙÙŠØ¯ÙŠÙˆ ÙƒØ§Ù† ÙŠÙØ±Ù‰ Ù…Ø±Ø© ÙˆØ§Ø­Ø¯Ø©*\nðŸ”¥ Crazy Seif BOT'
                }, { quoted: message });
                
            } else {
                await sock.sendMessage(chatId, {
                    text: 'ðŸ“¸ *Ø­ÙØ¸ ÙˆØ³Ø§Ø¦Ø· ØªÙØ±Ù‰ Ù…Ø±Ø© ÙˆØ§Ø­Ø¯Ø©*\n\n' +
                        '*Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…:* Ø±Ø¯ Ø¹Ù„Ù‰ ØµÙˆØ±Ø© Ø£Ùˆ ÙÙŠØ¯ÙŠÙˆ (ÙŠÙØ±Ù‰ Ù…Ø±Ø© ÙˆØ§Ø­Ø¯Ø©) Ø¨Ù€ `!Ù…Ø±Ø©`\n\n' +
                        '*Ù…Ø«Ø§Ù„:* Ù‚Ù… Ø¨Ø§Ù„Ø±Ø¯ Ø¹Ù„Ù‰ Ø±Ø³Ø§Ù„Ø© "ØªÙØ±Ù‰ Ù…Ø±Ø© ÙˆØ§Ø­Ø¯Ø©" ÙˆØ§ÙƒØªØ¨ `!Ù…Ø±Ø©`'
                }, { quoted: message });
            }
            
        } catch (error) {
            console.error('Ø®Ø·Ø£ ÙÙŠ Ø£Ù…Ø± "Ù…Ø±Ø©":', error);
            await sock.sendMessage(chatId, {
                text: 'âŒ ÙØ´Ù„ ÙÙŠ Ø§Ø³ØªØ±Ø¬Ø§Ø¹ Ø§Ù„ÙˆØ³Ø§Ø¦Ø· Ø§Ù„ØªÙŠ ØªÙØ±Ù‰ Ù…Ø±Ø© ÙˆØ§Ø­Ø¯Ø©. Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰ Ù„Ø§Ø­Ù‚Ø§Ù‹.'
            }, { quoted: message });
        }
    }
};

