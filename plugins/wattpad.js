import pkg from 'api-qasim';
const QasimAny = pkg;
import { channelInfo } from '../lib/messageConfig.js';

export default {
    command: 'قصص',
    aliases: ['wattpad', 'wattpadsearch', 'searchwattpad', 'روايات', 'بحث_قصص'],
    category: 'search',
    description: 'البحث عن قصص في واتباد',
    usage: '!قصص <نص البحث>',
    
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const query = args.join(' ').trim();
        
        if (!query) {
            return await sock.sendMessage(chatId, {
                text: '📚 *البحث في واتباد*\n\n' +
                    '*الاستخدام:* `!قصص <نص البحث>`\n' +
                    '*مثال:* `!قصص حب`\n' +
                    '*مثال:* `!قصص رعب`\n' +
                    '*مثال:* `!قصص مغامرات`',
                ...channelInfo
            }, { quoted: message });
        }
        
        try {
            const results = await QasimAny.wattpad(query);
            
            if (!Array.isArray(results) || results.length === 0) {
                throw new Error('لا توجد نتائج للبحث.');
            }
            
            const formattedResults = results.slice(0, 9).map((story, index) => {
                const title = story.judul || 'لا يوجد عنوان';
                const reads = story.dibaca || 'غير معروف';
                const votes = story.divote || 'غير معروف';
                const thumb = story.thumb || '';
                const link = story.link || 'لا يوجد رابط';
                
                return `${index + 1}. 📖 *${title}*\n` +
                       `   👁️ *المشاهدات:* ${reads}\n` +
                       `   👍 *التصويتات:* ${votes}\n` +
                       `   🔗 *الرابط:* ${link}`;
            }).join('\n\n');
            
            await sock.sendMessage(chatId, {
                text: `📚 *نتائج البحث عن:* "${query}"\n\n${formattedResults}\n\n🔥 *CRAZY-SEIF BOT* | 📞 201144534147`,
                ...channelInfo
            }, { quoted: message });
            
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ حدث خطأ: ${error.message || error}`,
                ...channelInfo
            }, { quoted: message });
        }
    }
};