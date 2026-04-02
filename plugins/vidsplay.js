import axios from 'axios';

export default {
    command: 'فيديو',
    aliases: ['vidsplay', 'vidsplaydl', 'vidsplayvideo', 'تحميل_فيديو'],
    category: 'download',
    description: 'تحميل فيديو وصورة مصغرة من Vidsplay',
    usage: '!فيديو <رابط Vidsplay>',
    
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const url = args?.[0];
        
        if (!url) {
            return await sock.sendMessage(chatId, { 
                text: '🎬 *تحميل فيديو من Vidsplay*\n\n' +
                    '*الاستخدام:* `!فيديو <الرابط>`\n' +
                    '*مثال:* `!فيديو https://www.vidsplay.com/golf-free-stock-video/`' 
            }, { quoted: message });
        }
        
        try {
            const apiUrl = `https://discardapi.dpdns.org/api/dl/vidsplay?apikey=guru&url=${encodeURIComponent(url)}`;
            const { data } = await axios.get(apiUrl, { timeout: 10000 });
            
            if (!data?.status || !data.result?.length) {
                return await sock.sendMessage(chatId, { 
                    text: '❌ لا يوجد فيديو لهذا الرابط.' 
                }, { quoted: message });
            }
            
            const videoUrl = data.result[0].video;
            const imageUrl = data.result[0].image;
            
            if (imageUrl) {
                await sock.sendMessage(chatId, { 
                    image: { url: imageUrl }, 
                    caption: '🖼️ *الصورة المصغرة*\n🔥 CRAZY-SEIF BOT' 
                }, { quoted: message });
            }
            
            if (videoUrl) {
                await sock.sendMessage(chatId, { 
                    video: { url: videoUrl }, 
                    caption: '🎬 *الفيديو*\n🔥 CRAZY-SEIF BOT | 📞 201144534147' 
                }, { quoted: message });
            }
            
        } catch (error) {
            console.error('خطأ في أمر فيديو Vidsplay:', error);
            
            if (error.code === 'ECONNABORTED') {
                await sock.sendMessage(chatId, { 
                    text: '❌ انتهت مهلة الطلب. قد تكون واجهة البرمجة بطيئة أو لا يمكن الوصول إليها.' 
                }, { quoted: message });
            } else {
                await sock.sendMessage(chatId, { 
                    text: '❌ فشل في جلب الفيديو من Vidsplay.' 
                }, { quoted: message });
            }
        }
    }
};