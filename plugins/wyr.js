import axios from 'axios';

export default {
    command: 'خير',
    aliases: ['wyr', 'wouldyourather', 'اختار', 'ايش_تختار'],
    category: 'fun',
    description: 'الحصول على سؤال "ماذا تفضل"',
    usage: '!خير',
    
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        
        try {
            const res = await axios.get('https://discardapi.dpdns.org/api/quote/wyr?apikey=guru');
            
            if (!res.data || res.data.status !== true) {
                return await sock.sendMessage(chatId, { 
                    text: '❌ فشل في جلب السؤال.' 
                }, { quoted: message });
            }
            
            const opt1 = res.data.question?.option1 || 'الخيار الأول غير موجود';
            const opt2 = res.data.question?.option2 || 'الخيار الثاني غير موجود';
            
            const replyText = `🤔 *ماذا تفضل*\n\n` +
                `◍ ${opt1}\n\n` +
                `◍ ${opt2}`;
            
            await sock.sendMessage(chatId, { text: replyText }, { quoted: message });
            
        } catch (err) {
            console.error('خطأ في أمر "ماذا تفضل":', err);
            await sock.sendMessage(chatId, { 
                text: '❌ حدث خطأ أثناء جلب السؤال.' 
            }, { quoted: message });
        }
    }
};