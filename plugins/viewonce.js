import { downloadContentFromMessage } from '@whiskeysockets/baileys';

export default {
    command: 'مرة',
    aliases: ['viewonce', 'viewmedia', 'vv', 'مرة_واحدة', 'صورة_مرة'],
    category: 'general',
    description: 'إعادة إرسال صورة أو فيديو يُرى مرة واحدة',
    usage: '!مرة (رد على وسائط تُرى مرة واحدة)',
    
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
                    caption: quotedImage.caption || '📸 *صورة كانت تُرى مرة واحدة*\n🔥 CRAZY-SEIF BOT'
                }, { quoted: message });
                
            } else if (quotedVideo && quotedVideo.viewOnce) {
                const stream = await downloadContentFromMessage(quotedVideo, 'video');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
                
                await sock.sendMessage(chatId, {
                    video: buffer,
                    fileName: 'media.mp4',
                    caption: quotedVideo.caption || '🎬 *فيديو كان يُرى مرة واحدة*\n🔥 CRAZY-SEIF BOT'
                }, { quoted: message });
                
            } else {
                await sock.sendMessage(chatId, {
                    text: '📸 *حفظ وسائط تُرى مرة واحدة*\n\n' +
                        '*الاستخدام:* رد على صورة أو فيديو (يُرى مرة واحدة) بـ `!مرة`\n\n' +
                        '*مثال:* قم بالرد على رسالة "تُرى مرة واحدة" واكتب `!مرة`'
                }, { quoted: message });
            }
            
        } catch (error) {
            console.error('خطأ في أمر "مرة":', error);
            await sock.sendMessage(chatId, {
                text: '❌ فشل في استرجاع الوسائط التي تُرى مرة واحدة. حاول مرة أخرى لاحقاً.'
            }, { quoted: message });
        }
    }
};