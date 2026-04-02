import axios from 'axios';

const AI_APIS = [
    (q) => `https://mistral.stacktoy.workers.dev/?apikey=Suhail&text=${encodeURIComponent(q)}`,
    (q) => `https://llama.gtech-apiz.workers.dev/?apikey=Suhail&text=${encodeURIComponent(q)}`,
    (q) => `https://mistral.gtech-apiz.workers.dev/?apikey=Suhail&text=${encodeURIComponent(q)}`
];

const اسال_الذكاء = async (السؤال) => {
    for (const رابط_الapi of AI_APIS) {
        try {
            const { data } = await axios.get(رابط_الapi(السؤال), { timeout: 15000 });
            const الرد = data?.data?.response;
            if (الرد && typeof الرد === 'string' && الرد.trim()) {
                return الرد.trim();
            }
        }
        catch {
            continue;
        }
    }
    throw new Error('جميع خدمات الذكاء الاصطناعي فشلت');
};

export default {
    command: 'اسال',
    aliases: ['gpt', 'ai', 'chat', 'ask', 'mistral', 'llama', 'ذكاء', 'سؤال', 'اسأل'],
    category: 'ai',
    description: 'اسأل سؤال للذكاء الاصطناعي',
    usage: '!اسال <السؤال>',
    
    async handler(sock, message, args, context) {
        const معرف_المحادثة = context.chatId || message.key.remoteJid;
        const السؤال = args.join(' ').trim();
        
        if (!السؤال) {
            return sock.sendMessage(معرف_المحادثة, { 
                text: '🤖 *مساعد الذكاء الاصطناعي*\n\n' +
                    `*الاستخدام:* \`!اسال <سؤالك>\`\n\n` +
                    '*أمثلة:*\n' +
                    '• `!اسال ما هي عاصمة مصر؟`\n' +
                    '• `!اسال اشرح لي الذكاء الاصطناعي`\n' +
                    '• `!اسال كم عمرك؟`'
            }, { quoted: message });
        }
        
        try {
            await sock.sendMessage(معرف_المحادثة, { react: { text: '🤖', key: message.key } });
            const الرد = await اسال_الذكاء(السؤال);
            await sock.sendMessage(معرف_المحادثة, { text: الرد }, { quoted: message });
        } catch (error) {
            console.error('خطأ في أمر الذكاء:', error.message);
            await sock.sendMessage(معرف_المحادثة, { 
                text: '❌ فشل الحصول على رد من الذكاء الاصطناعي. حاول مرة أخرى لاحقاً.' 
            }, { quoted: message });
        }
    }
};