/*****************************************************************************
 *                                                                           *
 *                     Developed By CRAZY-SEIF                               *
 *                                                                           *
 *  📞  WhatsApp : 201144534147                                              *
 *                                                                           *
 *    © 2026 CRAZY-SEIF. All rights reserved.                               *
 *                                                                           *
 *****************************************************************************/
import axios from 'axios';

export default {
    command: 'تويتر',
    aliases: ['xstalk', 'twstalk', 'xprofile', 'تويتر_معلومات', 'تويتر_بروفايل'],
    category: 'stalk',
    description: 'جلب معلومات بروفايل مستخدم تويتر',
    usage: '!تويتر <اسم_المستخدم>',
    
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        
        if (!args.length) {
            return await sock.sendMessage(chatId, {
                text: '🐦 *جلب معلومات تويتر*\n\n' +
                    '*الاستخدام:* `!تويتر <اسم_المستخدم>`\n' +
                    '*مثال:* `!تويتر ElonMusk`'
            }, { quoted: message });
        }
        
        const username = args[0];
        
        try {
            const { data } = await axios.get(`https://discardapi.dpdns.org/api/stalk/twitter`, {
                params: { apikey: 'guru', username }
            });
            
            if (!data?.result) {
                return await sock.sendMessage(chatId, { 
                    text: '❌ مستخدم تويتر غير موجود.' 
                }, { quoted: message });
            }
            
            const result = data.result;
            const profileImage = result.profile?.image || null;
            const bannerImage = result.profile?.banner || null;
            const verifiedMark = result.verified ? '✅ موثق' : '';
            
            const caption = `🐦 *معلومات بروفايل تويتر*\n\n` +
                `👤 الاسم: ${result.name || 'غير معروف'} ${verifiedMark}\n` +
                `🆔 اسم المستخدم: @${result.username || 'غير معروف'}\n` +
                `📝 السيرة الذاتية: ${result.description || 'لا يوجد'}\n` +
                `📍 الموقع: ${result.location || 'غير محدد'}\n` +
                `📅 تاريخ الانضمام: ${new Date(result.created_at).toLocaleDateString('ar-EG')}\n\n` +
                `👥 المتابعون: ${result.stats?.followers?.toLocaleString() || 0}\n` +
                `➡ يتابع: ${result.stats?.following?.toLocaleString() || 0}\n` +
                `❤️ الإعجابات: ${result.stats?.likes?.toLocaleString() || 0}\n` +
                `🖼 الوسائط: ${result.stats?.media?.toLocaleString() || 0}\n` +
                `🐦 التغريدات: ${result.stats?.tweets?.toLocaleString() || 0}\n` +
                `🔗 رابط البروفايل: https://twitter.com/${result.username}\n\n` +
                `🔥 *CRAZY-SEIF BOT* | 📞 201144534147`;
            
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
                    caption: `📌 صورة الغلاف لـ @${username}` 
                });
            }
            
        } catch (err) {
            console.error('خطأ في أمر تويتر:', err);
            await sock.sendMessage(chatId, { 
                text: '❌ فشل في جلب معلومات بروفايل تويتر.' 
            }, { quoted: message });
        }
    }
};

/*****************************************************************************
 *                                                                           *
 *                     Developed By CRAZY-SEIF                               *
 *                                                                           *
 *  📞  WhatsApp : 201144534147                                              *
 *                                                                           *
 *    © 2026 CRAZY-SEIF. All rights reserved.                               *
 *                                                                           *
 *****************************************************************************/