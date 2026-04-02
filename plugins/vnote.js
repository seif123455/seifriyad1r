/*****************************************************************************
 *                                                                           *
 *                     Developed By CRAZY-SEIF                               *
 *                                                                           *
 *  📞  WhatsApp : 201144534147                                              *
 *                                                                           *
 *    © 2026 CRAZY-SEIF. All rights reserved.                               *
 *                                                                           *
 *****************************************************************************/
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default {
    command: 'بصمة',
    aliases: ['vnote', 'voicenote', 'vn', 'صوت_ملاحظة'],
    category: 'tools',
    description: 'تحويل أي رسالة صوتية إلى ملاحظة صوتية (بصمة)',
    usage: 'رد على ملف صوتي بـ !بصمة',
    
    async handler(sock, message, _args, _context) {
        const chatId = message.key.remoteJid;
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quoted?.audioMessage) {
            return sock.sendMessage(chatId, {
                text: '🎙️ *تحويل إلى بصمة صوتية*\n\n' +
                    '*الاستخدام:* رد على ملف صوتي بـ `!بصمة`\n\n' +
                    '*مثال:* قم بالرد على رسالة صوتية واكتب `!بصمة`'
            }, { quoted: message });
        }
        
        const tmpDir = path.join(process.cwd(), 'tmp');
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
        
        const tmpIn = path.join(tmpDir, `vnote_in_${Date.now()}`);
        const tmpOut = path.join(tmpDir, `vnote_out_${Date.now()}.ogg`);
        
        try {
            const stream = await downloadContentFromMessage(quoted.audioMessage, 'audio');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
            
            console.log('[بصمة] الحجم الأصلي:', buffer.length, 'نوع الملف:', quoted.audioMessage.mimetype);
            fs.writeFileSync(tmpIn, buffer);
            
            await execAsync(`ffmpeg -y -i "${tmpIn}" -c:a libopus -b:a 64k -ar 48000 -ac 1 "${tmpOut}"`);
            
            const opusBuffer = fs.readFileSync(tmpOut);
            console.log('[بصمة] الحجم بعد التحويل:', opusBuffer.length);
            
            await sock.sendMessage(chatId, {
                audio: opusBuffer,
                ptt: true,
                mimetype: 'audio/ogg; codecs=opus'
            }, { quoted: message });
            
        } catch (error) {
            console.error('[بصمة] خطأ:', error.message);
            await sock.sendMessage(chatId, {
                text: '❌ فشل في تحويل الصوت إلى بصمة صوتية. تأكد من تثبيت ffmpeg.'
            }, { quoted: message });
        } finally {
            try { fs.unlinkSync(tmpIn); } catch { }
            try { fs.unlinkSync(tmpOut); } catch { }
        }
    }
};