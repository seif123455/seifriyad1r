/*****************************************************************************
 *                                                                           *
 *                     Developed By Crazy Seif                               *
 *                                                                           *
 *  ðŸ“ž  WhatsApp : 01144534147                                              *
 *                                                                           *
 *    Â© 2026 Crazy Seif. All rights reserved.                               *
 *                                                                           *
 *****************************************************************************/
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default {
    command: 'Ø¨ØµÙ…Ø©',
    aliases: ['vnote', 'voicenote', 'vn', 'ØµÙˆØª_Ù…Ù„Ø§Ø­Ø¸Ø©'],
    category: 'Ø£Ø¯ÙˆØ§Øª',
    description: 'ØªØ­ÙˆÙŠÙ„ Ø£ÙŠ Ø±Ø³Ø§Ù„Ø© ØµÙˆØªÙŠØ© Ø¥Ù„Ù‰ Ù…Ù„Ø§Ø­Ø¸Ø© ØµÙˆØªÙŠØ© (Ø¨ØµÙ…Ø©)',
    usage: 'Ø±Ø¯ Ø¹Ù„Ù‰ Ù…Ù„Ù ØµÙˆØªÙŠ Ø¨Ù€ !Ø¨ØµÙ…Ø©',
    
    async handler(sock, message, _args, _context) {
        const chatId = message.key.remoteJid;
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quoted?.audioMessage) {
            return sock.sendMessage(chatId, {
                text: 'ðŸŽ™ï¸ *ØªØ­ÙˆÙŠÙ„ Ø¥Ù„Ù‰ Ø¨ØµÙ…Ø© ØµÙˆØªÙŠØ©*\n\n' +
                    '*Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…:* Ø±Ø¯ Ø¹Ù„Ù‰ Ù…Ù„Ù ØµÙˆØªÙŠ Ø¨Ù€ `!Ø¨ØµÙ…Ø©`\n\n' +
                    '*Ù…Ø«Ø§Ù„:* Ù‚Ù… Ø¨Ø§Ù„Ø±Ø¯ Ø¹Ù„Ù‰ Ø±Ø³Ø§Ù„Ø© ØµÙˆØªÙŠØ© ÙˆØ§ÙƒØªØ¨ `!Ø¨ØµÙ…Ø©`'
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
            
            console.log('[Ø¨ØµÙ…Ø©] Ø§Ù„Ø­Ø¬Ù… Ø§Ù„Ø£ØµÙ„ÙŠ:', buffer.length, 'Ù†ÙˆØ¹ Ø§Ù„Ù…Ù„Ù:', quoted.audioMessage.mimetype);
            fs.writeFileSync(tmpIn, buffer);
            
            await execAsync(`ffmpeg -y -i "${tmpIn}" -c:a libopus -b:a 64k -ar 48000 -ac 1 "${tmpOut}"`);
            
            const opusBuffer = fs.readFileSync(tmpOut);
            console.log('[Ø¨ØµÙ…Ø©] Ø§Ù„Ø­Ø¬Ù… Ø¨Ø¹Ø¯ Ø§Ù„ØªØ­ÙˆÙŠÙ„:', opusBuffer.length);
            
            await sock.sendMessage(chatId, {
                audio: opusBuffer,
                ptt: true,
                mimetype: 'audio/ogg; codecs=opus'
            }, { quoted: message });
            
        } catch (error) {
            console.error('[Ø¨ØµÙ…Ø©] Ø®Ø·Ø£:', error.message);
            await sock.sendMessage(chatId, {
                text: 'âŒ ÙØ´Ù„ ÙÙŠ ØªØ­ÙˆÙŠÙ„ Ø§Ù„ØµÙˆØª Ø¥Ù„Ù‰ Ø¨ØµÙ…Ø© ØµÙˆØªÙŠØ©. ØªØ£ÙƒØ¯ Ù…Ù† ØªØ«Ø¨ÙŠØª ffmpeg.'
            }, { quoted: message });
        } finally {
            try { fs.unlinkSync(tmpIn); } catch { }
            try { fs.unlinkSync(tmpOut); } catch { }
        }
    }
};

