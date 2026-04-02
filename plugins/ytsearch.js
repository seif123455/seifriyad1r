/*****************************************************************************
 *                                                                           *
 *                     Developed By CRAZY-SEIF                               *
 *                                                                           *
 *  📞  WhatsApp : 201144534147                                              *
 *                                                                           *
 *    © 2026 CRAZY-SEIF. All rights reserved.                               *
 *                                                                           *
 *****************************************************************************/
import yts from 'yt-search';

export default {
    command: 'يوتيوب',
    aliases: ['ytsearch', 'yts', 'playlist', 'playlista', 'بحث_يوتيوب', 'يوت'],
    category: 'download',
    description: 'البحث عن فيديوهات في يوتيوب',
    usage: '!يوتيوب <نص البحث>',
    
    async handler(sock, message, args, context) {
        const { chatId, config } = context;
        const query = args.join(' ');
        const prefix = '!';
        
        if (!query) {
            return sock.sendMessage(chatId, {
                text: `🔍 *البحث في يوتيوب*\n\n` +
                    `*الاستخدام:* \`${prefix}يوتيوب <نص البحث>\`\n` +
                    `*مثال:* \`${prefix}يوتيوب محمد منير\``
            }, { quoted: message });
        }
        
        try {
            await sock.sendMessage(chatId, { react: { text: '🔍', key: message.key } });
            
            const result = await yts(query);
            const videos = result.videos.slice(0, 10);
            
            if (videos.length === 0) {
                return sock.sendMessage(chatId, { 
                    text: '❌ لا توجد نتائج للبحث.' 
                });
            }
            
            let searchText = `✨ *نتائج البحث عن:* ${query} ✨\n\n`;
            
            videos.forEach((v, index) => {
                searchText += `*${index + 1}. 🎧 ${v.title}*\n`;
                searchText += `*⌚ المدة:* ${v.timestamp}\n`;
                searchText += `*👀 المشاهدات:* ${v.views.toLocaleString()}\n`;
                searchText += `*🔗 الرابط:* ${v.url}\n`;
                searchText += `──────────────────\n`;
            });
            
            searchText += `\n🔥 *CRAZY-SEIF BOT* | 📞 201144534147`;
            
            await sock.sendMessage(chatId, {
                image: { url: videos[0].image },
                caption: searchText
            }, { quoted: message });
            
        } catch (error) {
            console.error('خطأ في البحث في يوتيوب:', error);
            await sock.sendMessage(chatId, { 
                text: '❌ حدث خطأ أثناء البحث في يوتيوب.' 
            });
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