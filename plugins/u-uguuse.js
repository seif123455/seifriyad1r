import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import fs from 'fs';
import path from 'path';
import { uploadToUguu } from '../lib/uploaders.js';

export default {
    command: 'رفع_مؤقت',
    aliases: ['uguu', 'ug', 'uguuse', 'رفع_وقتي', 'تخزين_مؤقت'],
    category: 'upload',
    description: 'رفع الملفات إلى Uguu.se (تخزين مؤقت)',
    usage: '!رفع_مؤقت (رد على وسائط)',
    
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        
        try {
            const hasMedia = message.message?.imageMessage ||
                message.message?.videoMessage ||
                message.message?.stickerMessage ||
                message.message?.documentMessage;
            
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            
            if (!hasMedia && !quotedMsg) {
                await sock.sendMessage(chatId, { 
                    text: '📤 *رفع الملفات إلى Uguu.se (تخزين مؤقت)*\n\n' +
                        '*الاستخدام:* `!رفع_مؤقت` مع رد على ملف أو إرسال ملف مع الأمر\n\n' +
                        '*يدعم:* صور، فيديوهات، ملصقات، مستندات\n\n' +
                        '*مثال:* قم بالرد على صورة واكتب `!رفع_مؤقت`\n\n' +
                        '⚠️ *ملاحظة:* الروابط مؤقتة وليست دائمة.'
                }, { quoted: message });
                return;
            }
            
            const mediaSource = hasMedia ? message.message : quotedMsg;
            const type = Object.keys(mediaSource).find(key => 
                ['imageMessage', 'videoMessage', 'stickerMessage', 'documentMessage'].includes(key)
            );
            
            if (!type) {
                await sock.sendMessage(chatId, { 
                    text: '⚠️ نوع الملف غير مدعوم!' 
                }, { quoted: message });
                return;
            }
            
            await sock.sendMessage(chatId, { 
                text: '📤 جاري رفع الملف إلى Uguu.se...' 
            }, { quoted: message });
            
            const mediaType = type === 'stickerMessage' ? 'sticker' : type.replace('Message', '');
            const stream = await downloadContentFromMessage(mediaSource[type], mediaType);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            
            let ext = 'bin';
            let fileType = 'ملف';
            
            if (type === 'imageMessage') {
                ext = 'jpg';
                fileType = 'صورة';
            } else if (type === 'videoMessage') {
                ext = 'mp4';
                fileType = 'فيديو';
            } else if (type === 'stickerMessage') {
                ext = 'webp';
                fileType = 'ملصق';
            } else if (mediaSource[type].fileName) {
                ext = mediaSource[type].fileName.split('.').pop() || 'bin';
                fileType = 'مستند';
            }
            
            const tempDir = path.join('./temp');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
            
            const tempPath = path.join(tempDir, `uguu_${Date.now()}.${ext}`);
            fs.writeFileSync(tempPath, buffer);
            
            const result = await uploadToUguu(tempPath);
            
            const sizeKB = (buffer.length / 1024).toFixed(2);
            
            await sock.sendMessage(chatId, {
                text: `✅ *تم رفع ${fileType} إلى Uguu.se بنجاح!*\n\n` +
                    `┏━━━━━━━━━━━━━━━━━━━━━━┓\n` +
                    `┃ 📁 *النوع:* ${fileType}\n` +
                    `┃ 📦 *الحجم:* ${sizeKB} كيلوبايت\n` +
                    `┃ 🔗 *الرابط:* ${result.url}\n` +
                    `┃ ⏱️ *المدة:* رابط مؤقت\n` +
                    `┗━━━━━━━━━━━━━━━━━━━━━━┛\n\n` +
                    `🔥 *CRAZY-SEIF BOT* | 📞 201144534147`
            }, { quoted: message });
            
            fs.unlinkSync(tempPath);
            
        } catch (error) {
            console.error('خطأ في رفع Uguu:', error);
            await sock.sendMessage(chatId, { 
                text: `❌ فشل الرفع: ${error.message}` 
            }, { quoted: message });
        }
    }
};