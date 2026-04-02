import axios from 'axios';

async function fetchWithRetries(url, retries = 3, delay = 2000) {
    let attempt = 0;
    while (attempt < retries) {
        try {
            const { data } = await axios.get(url);
            return data;
        } catch (err) {
            attempt++;
            console.error(`[لماذا] المحاولة ${attempt} فشلت:`, err.message);
            if (attempt >= retries) throw new Error('تم الوصول للحد الأقصى من المحاولات');
            await new Promise(r => setTimeout(r, delay));
        }
    }
}

export default {
    command: 'لماذا',
    aliases: ['why', 'whyme', 'question', 'سؤال', 'ليش'],
    category: 'fun',
    description: 'الحصول على سؤال "لماذا" عشوائي',
    usage: '!لماذا',
    
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        
        try {
            const data = await fetchWithRetries('https://nekos.life/api/v2/why');
            
            if (!data?.why?.trim()) {
                return await sock.sendMessage(chatId, { 
                    text: '❌ رد غير صالح من واجهة البرمجة. حاول مرة أخرى.' 
                }, { quoted: message });
            }
            
            const whyText = data.why;
            
            // ترجمة "Why?" إلى "لماذا؟" في بداية السؤال
            let finalText = whyText;
            if (whyText.toLowerCase().startsWith('why')) {
                finalText = '🤔 *لماذا؟*\n\n' + whyText.replace(/^why\s*/i, '');
            } else {
                finalText = `🤔 *لماذا؟*\n\n${whyText}`;
            }
            
            await sock.sendMessage(chatId, { 
                text: finalText + '\n\n🔥 *CRAZY-SEIF BOT* | 📞 201144534147' 
            }, { quoted: message });
            
        } catch (error) {
            console.error('خطأ في أمر "لماذا":', error);
            await sock.sendMessage(chatId, { 
                text: '❌ فشل في جلب السؤال. حاول مرة أخرى لاحقاً.' 
            }, { quoted: message });
        }
    }
};