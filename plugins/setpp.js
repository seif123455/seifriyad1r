import fs from 'fs';
import path from 'path';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import isOwnerOrSudo from '../lib/isOwner.js';
export default {
    command: 'سيتبب',
    aliases: ['setppic', 'setdp', 'setpp'],
    category: 'المالك',
    description: 'تعيين ور تحديث تهي بوت صورة شخصية صورة (المالك ونلي)',
    usage: '.سيتبب (رد تو ان صورة)',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        try {
            const senderId = message.key.participant || message.key.remoteJid;
            const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
            if (!message.key.fromMe && !isOwner) {
                await sock.sendMessage(chatId, {
                    text: '*This command is only available for the owner!*'
                }, { quoted: message });
                return;
            }
            const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quotedMessage) {
                await sock.sendMessage(chatId, {
                    text: 'âš ï¸ Please reply to an image with the .setpp command!'
                }, { quoted: message });
                return;
            }
            const imageMessage = quotedMessage.imageMessage || quotedMessage.stickerMessage;
            if (!imageMessage) {
                await sock.sendMessage(chatId, {
                    text: '*The replied message must contain an image!*'
                }, { quoted: message });
                return;
            }
            const tmpDir = path.join(process.cwd(), 'tmp');
            if (!fs.existsSync(tmpDir))
                fs.mkdirSync(tmpDir, { recursive: true });
            const stream = await downloadContentFromMessage(imageMessage, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream)
                buffer = Buffer.concat([buffer, chunk]);
            const imagePath = path.join(tmpDir, `profile_${Date.now()}.jpg`);
            fs.writeFileSync(imagePath, buffer);
            await sock.updateProfilePicture(sock.user.id, { url: imagePath });
            fs.unlinkSync(imagePath);
            await sock.sendMessage(chatId, {
                text: 'âœ… Successfully updated bot profile picture!'
            }, { quoted: message });
        }
        catch (error) {
            console.error('SetPP Command Error:', error);
            await sock.sendMessage(chatId, {
                text: 'âŒ Failed to update profile picture!'
            }, { quoted: message });
        }
    }
};




