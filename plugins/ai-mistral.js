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
    command: 'ذكاء',
    aliases: ['mistral', 'ai', 'chat', 'ask', 'اسال', 'سؤال', 'gpt', 'llama'],
    category: 'ai',
    description: 'اسأل سؤال للذكاء الاصطناعي',
    usage: '!ذكاء <السؤال>',
    
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const السؤال = args.join(' ').trim();
        
        if (!السؤال) {
            return sock.sendMessage(chatId, { 
                text: `🤖 *مساعد الذكاء الاصطناعي*\n\n` +
                    `*الاستخدام:* \`!ذكاء <سؤالك>\`\n\n` +
                    `*أمثلة:*\n` +
                    `• \`!ذكاء ما هي عاصمة مصر؟\`\n` +
                    `• \`!ذكاء اشرح لي الذكاء الاصطناعي\`\n` +
                    `• \`!ذكاء كم عمرك؟\``
            }, { quoted: message });
        }
        
        try {
            await sock.sendMessage(chatId, { react: { text: '🤖', key: message.key } });
            const الرد = await اسال_الذكاء(السؤال);
            await sock.sendMessage(chatId, { text: الرد }, { quoted: message });
        } catch (error) {
            console.error('خطأ في أمر الذكاء:', error.message);
            await sock.sendMessage(chatId, { 
                text: '❌ فشل الحصول على رد من الذكاء الاصطناعي. حاول مرة أخرى لاحقاً.' 
            }, { quoted: message });
        }
    }
};