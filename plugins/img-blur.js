import { downloadMediaMessage } from '@whiskeysockets/baileys';
import sharp from 'sharp';
export default {
    command: 'بلور',
    aliases: ['blurimg', 'blurpic', 'blur'],
    category: 'أدوات',
    description: 'اببلي ا بلور يففيكت تو ان صورة',
    usage: '.بلور (رد تو ان صورة ور إرسال صورة ويته كابتيون)',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        try {
            let imageBuffer;
            if (quotedMessage?.imageMessage) {
                const quoted = { message: { imageMessage: quotedMessage.imageMessage } };
                imageBuffer = await downloadMediaMessage(quoted, 'buffer', {});
            }
            else if (message.message?.imageMessage) {
                imageBuffer = await downloadMediaMessage(message, 'buffer', {}, {});
            }
            else {
                await sock.sendMessage(chatId, {
                    text: 'Please reply to an image or send an image with caption `.blur`'
                }, { quoted: message });
                return;
            }
            const resizedImage = await sharp(imageBuffer)
                .resize(800, 800, {
                fit: 'inside',
                withoutEnlargement: true
            })
                .jpeg({ quality: 80 })
                .toBuffer();
            const blurredImage = await sharp(resizedImage)
                .blur(10)
                .toBuffer();
            await sock.sendMessage(chatId, {
                image: blurredImage,
                caption: 'âœ¨ *Image Blurred Successfully!*',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363319098372999@newsletter',
                        newsletterName: 'MEGA MD',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
        }
        catch (error) {
            console.error('Error in blur command:', error);
            await sock.sendMessage(chatId, {
                text: 'âŒ Failed to blur image. Please try again later.'
            }, { quoted: message });
        }
    }
};




