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
    command: 'تحميل',
    aliases: ['alamy', 'alamydl', 'alamydownload', 'صور', 'فيديو'],
    category: 'download',
    description: 'تحميل صورة أو فيديو من Alamy',
    usage: '!تحميل <رابط Alamy>',
    
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const url = args?.[0]?.trim();
        
        if (!url) {
            return await sock.sendMessage(chatId, { 
                text: '❌ *الرجاء إرسال رابط Alamy*\n\n' +
                    '*مثال:*\n' +
                    '`!تحميل https://www.alamy.com/video/beautiful-lake...`' 
            }, { quoted: message });
        }
        
        try {
            const apiUrl = `https://discardapi.dpdns.org/api/dl/alamy?apikey=guru&url=${encodeURIComponent(url)}`;
            const { data } = await axios.get(apiUrl, { timeout: 10000 });
            
            if (!data?.status || !data.result?.length) {
                return await sock.sendMessage(chatId, { 
                    text: '❌ فشل في جلب الوسائط من الرابط المقدم.' 
                }, { quoted: message });
            }
            
            const isValidUrl = (u) => u && u.startsWith('http');
            let sent = false;
            
            for (const item of data.result) {
                if (isValidUrl(item.video)) {
                    await sock.sendMessage(chatId, { 
                        video: { url: item.video }, 
                        caption: '🎬 *فيديو Alamy*\n🔥 CRAZY-SEIF' 
                    }, { quoted: message });
                    sent = true;
                }
                if (isValidUrl(item.image)) {
                    await sock.sendMessage(chatId, { 
                        image: { url: item.image }, 
                        caption: '🖼️ *صورة Alamy*\n🔥 CRAZY-SEIF' 
                    }, { quoted: message });
                    sent = true;
                }
            }
            
            if (!sent) {
                await sock.sendMessage(chatId, { 
                    text: '❌ لم يتم العثور على وسائط صالحة في الرابط.' 
                }, { quoted: message });
            }
            
        } catch (error) {
            console.error('خطأ في أمر التحميل:', error);
            if (error.code === 'ECONNABORTED') {
                await sock.sendMessage(chatId, { 
                    text: '❌ انتهت مهلة الطلب. قد تكون واجهة البرمجة بطيئة أو لا يمكن الوصول إليها.' 
                }, { quoted: message });
            } else {
                await sock.sendMessage(chatId, { 
                    text: '❌ فشل تحميل الوسائط من رابط Alamy.' 
                }, { quoted: message });
            }
        }
    }
};