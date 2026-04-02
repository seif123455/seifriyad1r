import axios from 'axios';
import { channelInfo } from '../lib/messageConfig.js';

export default {
    command: 'طقس',
    aliases: ['weather', 'forecast', 'climate', 'حالة_الطقس', 'جو'],
    category: 'info',
    description: 'الحصول على حالة الطقس الحالية لمدينة معينة',
    usage: '!طقس <المدينة>',
    
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const city = args.join(' ').trim();
        
        if (!city) {
            return await sock.sendMessage(chatId, {
                text: "🌤️ *حالة الطقس*\n\n" +
                    "*الاستخدام:* `!طقس <اسم المدينة>`\n" +
                    "*مثال:* `!طقس القاهرة`\n" +
                    "*مثال:* `!طقس دبي`\n" +
                    "*مثال:* `!طقس لندن`",
                ...channelInfo
            }, { quoted: message });
        }
        
        try {
            const apiKey = '060a6bcfa19809c2cd4d97a212b19273';
            const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`);
            const weather = response.data;
            
            // ترجمة وصف الطقس
            const weatherDesc = {
                'clear sky': 'سماء صافية',
                'few clouds': 'قليل من الغيوم',
                'scattered clouds': 'غيوم متفرقة',
                'broken clouds': 'غيوم متكسرة',
                'overcast clouds': 'غيوم كثيفة',
                'light rain': 'مطر خفيف',
                'moderate rain': 'مطر متوسط',
                'heavy rain': 'مطر غزير',
                'thunderstorm': 'عاصفة رعدية',
                'snow': 'ثلج',
                'mist': 'ضباب',
                'fog': 'ضباب كثيف'
            };
            
            let description = weather.weather[0].description;
            const arabicDesc = weatherDesc[description.toLowerCase()] || description;
            
            const weatherText = `🌤️ *حالة الطقس*\n\n` +
                `┏━━━━━━━━━━━━━━━━━━━━━━┓\n` +
                `┃ 🌍 *المدينة:* ${weather.name}\n` +
                `┃ 🗺️ *الدولة:* ${weather.sys.country}\n` +
                `┃ 🌥️ *الحالة:* ${arabicDesc}\n` +
                `┣━━━━━━━━━━━━━━━━━━━━━━┫\n` +
                `┃ 🌡️ *الحرارة:* ${weather.main.temp}°C\n` +
                `┃ 🔥 *الحرارة العظمى:* ${weather.main.temp_max}°C\n` +
                `┃ 💧 *الحرارة الصغرى:* ${weather.main.temp_min}°C\n` +
                `┃ 💦 *الرطوبة:* ${weather.main.humidity}%\n` +
                `┃ 🌬️ *سرعة الرياح:* ${weather.wind.speed} كم/س\n` +
                `┗━━━━━━━━━━━━━━━━━━━━━━┛\n\n` +
                `🔥 *CRAZY-SEIF BOT* | 📞 201144534147`;
            
            await sock.sendMessage(chatId, {
                text: weatherText,
                ...channelInfo
            }, { quoted: message });
            
        } catch (error) {
            console.error('خطأ في أمر الطقس:', error);
            await sock.sendMessage(chatId, {
                text: '❌ عذراً، لم أتمكن من جلب حالة الطقس. تأكد من صحة اسم المدينة.',
                ...channelInfo
            }, { quoted: message });
        }
    }
};