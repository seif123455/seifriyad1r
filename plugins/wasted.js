import axios from 'axios';
import { channelInfo } from '../lib/messageConfig.js';

export default {
    command: 'هلاك',
    aliases: ['wasted', 'waste', 'موت', 'تحطيم'],
    category: 'fun',
    description: 'عمل تأثير "هلاك" على صورة الشخص',
    usage: '!هلاك @المستخدم',
    
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
                text: '💀 *تأثير الهلاك*\n\n' +
                    '*الاستخدام:* `!هلاك @المستخدم`\n' +
                    '*مثال:* `!هلاك @username`\n\n' +
                    '*أو رد على رسالة الشخص ثم اكتب:* `!هلاك`',
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
                           (userToWaste.includes('@s.whatsapp.net') ? userToWaste.replace('@s.whatsapp.net', '') : 'المستخدم');
            
            await sock.sendMessage(chatId, {
                image: Buffer.from(wastedResponse.data),
                caption: `⚰️ *هلاك* : ${userName} 💀\n\n` +
                    `⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n` +
                    `💀 *تحطم إلى أجزاء!*\n` +
                    `🔥 *CRAZY-SEIF BOT* | 📞 201144534147`,
                mentions: [userToWaste],
                ...channelInfo
            }, { quoted: message });
            
        } catch (error) {
            console.error('خطأ في أمر الهلاك:', error);
            await sock.sendMessage(chatId, {
                text: '❌ فشل في إنشاء صورة الهلاك! حاول مرة أخرى لاحقاً.',
                ...channelInfo
            }, { quoted: message });
        }
    }
};