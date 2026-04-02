import { downloadMediaMessage } from '@whiskeysockets/baileys';
import fs from 'fs';
import path from 'path';
import { UploadFileUgu, TelegraPh } from '../lib/uploader.js';

async function getMediaBuffer(msg, sock) {
    return await downloadMediaMessage(msg, 'buffer', {}, {
        logger: sock.logger,
        reuploadRequest: sock.updateMediaMessage
    });
}

function getQuotedMessage(message) {
    const ctx = message.message?.extendedTextMessage?.contextInfo;
    if (!ctx?.quotedMessage) return null;
    return {
        key: {
            remoteJid: message.key.remoteJid,
            fromMe: false,
            id: ctx.stanzaId,
            participant: ctx.participant
        },
        message: ctx.quotedMessage
    };
}

function getExtFromMessage(msg) {
    const m = msg.message;
    if (m.imageMessage) return '.jpg';
    if (m.videoMessage) return '.mp4';
    if (m.audioMessage) return '.mp3';
    if (m.stickerMessage) return '.webp';
    if (m.documentMessage) {
        return path.extname(m.documentMessage.fileName || '') || '.bin';
    }
    return null;
}

export default {
    command: 'رابط_وسائط',
    aliases: ['url', 'geturl', 'mediaurl', 'رابط_صورة', 'رابط_فيديو'],
    category: 'tools',
    description: 'الحصول على رابط للوسائط (صورة، فيديو، صوت، ملصق، ملف)',
    usage: '!رابط_وسائط (أرسل أو رد على وسائط)',
    
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        
        try {
            let targetMsg = null;
            
            if (message.message?.imageMessage ||
                message.message?.videoMessage ||
                message.message?.audioMessage ||
                message.message?.stickerMessage ||
                message.message?.documentMessage) {
                targetMsg = message;
            }
            
            if (!targetMsg) {
                const quoted = getQuotedMessage(message);
                if (quoted) targetMsg = quoted;
            }
            
            if (!targetMsg) {
                return sock.sendMessage(chatId, { 
                    text: '📎 *تحويل الوسائط إلى رابط*\n\n' +
                        '*الاستخدام:* أرسل أو رد على وسائط (صورة، فيديو، صوت، ملصق، ملف) بـ `!رابط_وسائط`\n\n' +
                        '*مثال:* قم بالرد على صورة واكتب `!رابط_وسائط`' 
                }, { quoted: message });
            }
            
            const ext = getExtFromMessage(targetMsg);
            if (!ext) throw new Error('نوع الوسائط غير مدعوم');
            
            const buffer = await getMediaBuffer(targetMsg, sock);
            if (!buffer) throw new Error('فشل في تحميل الوسائط');
            
            const tempDir = path.join(process.cwd(), 'tmp');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
            
            const tempPath = path.join(tempDir, `${Date.now()}${ext}`);
            fs.writeFileSync(tempPath, buffer);
            
            let url = '';
            
            try {
                if (['.jpg', '.png', '.webp'].includes(ext)) {
                    try {
                        url = await TelegraPh(tempPath);
                    } catch {
                        const res = await UploadFileUgu(tempPath);
                        url = typeof res === 'string' ? res : (res.url || res.url_full || '');
                    }
                } else {
                    const res = await UploadFileUgu(tempPath);
                    url = typeof res === 'string' ? res : (res.url || res.url_full || '');
                }
            } finally {
                setTimeout(() => {
                    try { fs.unlinkSync(tempPath); } catch { }
                }, 2000);
            }
            
            if (!url) {
                return sock.sendMessage(chatId, { 
                    text: '❌ فشل في رفع الوسائط.' 
                }, { quoted: message });
            }
            
            // تحديد نوع الوسائط للرسالة
            let mediaType = 'وسائط';
            if (ext === '.jpg') mediaType = 'صورة';
            else if (ext === '.mp4') mediaType = 'فيديو';
            else if (ext === '.mp3') mediaType = 'صوت';
            else if (ext === '.webp') mediaType = 'ملصق';
            else if (ext === '.bin') mediaType = 'ملف';
            
            await sock.sendMessage(chatId, { 
                text: `🔗 *رابط ${mediaType}*\n\n` +
                    `📎 *الرابط:* ${url}\n\n` +
                    `⏱️ *تاريخ الانتهاء:* لا ينتهي (رابط دائم)\n\n` +
                    `🔥 *CRAZY-SEIF BOT* | 📞 201144534147` 
            }, { quoted: message });
            
        } catch (error) {
            console.error('[رابط_وسائط] خطأ:', error);
            await sock.sendMessage(chatId, { 
                text: '❌ فشل في تحويل الوسائط إلى رابط.' 
            }, { quoted: message });
        }
    }
};