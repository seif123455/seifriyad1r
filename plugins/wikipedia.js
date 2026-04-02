import axios from 'axios';
import { channelInfo } from '../lib/messageConfig.js';

export default {
    command: 'ويكيبيديا',
    aliases: ['wiki', 'wikipedia', 'موسوعة', 'بحث_ويكي'],
    category: 'search',
    description: 'البحث في موسوعة ويكيبيديا',
    usage: '!ويكيبيديا <نص البحث>',
    
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const query = args.join(' ').trim();
        
        if (!query) {
            return await sock.sendMessage(chatId, {
                text: "📚 *البحث في ويكيبيديا*\n\n" +
                    "*الاستخدام:* `!ويكيبيديا <نص البحث>`\n" +
                    "*مثال:* `!ويكيبيديا مصر`\n" +
                    "*مثال:* `!ويكيبيديا الذكاء الاصطناعي`",
                ...channelInfo
            }, { quoted: message });
        }
        
        const formattedQuery = query.replace(/ /g, "_");
        
        try {
            const res = await axios.get(`https://ar.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(formattedQuery)}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CRAZY-SEIF-BOT/1.0',
                    'Accept-Language': 'ar'
                }
            });
            
            const data = res.data;
            
            if (data.extract) {
                let resultText = `📚 *ويكيبيديا*\n\n` +
                    `🔍 *البحث:* ${data.title}\n\n` +
                    `📝 *الملخص:*\n${data.extract}\n\n` +
                    `🔗 *للمزيد:* ${data.content_urls?.desktop?.page || 'https://ar.wikipedia.org'}\n\n` +
                    `🔥 *CRAZY-SEIF BOT* | 📞 201144534147`;
                
                // لو في صورة للصفحة
                if (data.thumbnail?.source) {
                    await sock.sendMessage(chatId, {
                        image: { url: data.thumbnail.source },
                        caption: resultText,
                        ...channelInfo
                    }, { quoted: message });
                } else {
                    await sock.sendMessage(chatId, {
                        text: resultText,
                        ...channelInfo
                    }, { quoted: message });
                }
            } else {
                await sock.sendMessage(chatId, {
                    text: "⚠️ لا توجد نتائج للبحث. حاول بكلمات مختلفة.",
                    ...channelInfo
                }, { quoted: message });
            }
            
        } catch (e) {
            console.error('خطأ في أمر ويكيبيديا:', e.message || e);
            
            // حاول البحث بالانجليزي لو العربي فشل
            try {
                const englishQuery = query.replace(/ /g, "_");
                const resEn = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(englishQuery)}`, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CRAZY-SEIF-BOT/1.0',
                        'Accept-Language': 'en'
                    }
                });
                
                const dataEn = resEn.data;
                
                if (dataEn.extract) {
                    let resultText = `📚 *Wikipedia*\n\n` +
                        `🔍 *Search:* ${dataEn.title}\n\n` +
                        `📝 *Summary:*\n${dataEn.extract}\n\n` +
                        `🔗 *Read more:* ${dataEn.content_urls?.desktop?.page}\n\n` +
                        `🔥 *CRAZY-SEIF BOT* | 📞 201144534147`;
                    
                    if (dataEn.thumbnail?.source) {
                        await sock.sendMessage(chatId, {
                            image: { url: dataEn.thumbnail.source },
                            caption: resultText,
                            ...channelInfo
                        }, { quoted: message });
                    } else {
                        await sock.sendMessage(chatId, {
                            text: resultText,
                            ...channelInfo
                        }, { quoted: message });
                    }
                } else {
                    await sock.sendMessage(chatId, {
                        text: "⚠️ لا توجد نتائج للبحث. حاول بكلمات مختلفة.",
                        ...channelInfo
                    }, { quoted: message });
                }
            } catch (e2) {
                await sock.sendMessage(chatId, {
                    text: "⚠️ لا توجد نتائج للبحث أو ويكيبيديا حظرت الطلب.",
                    ...channelInfo
                }, { quoted: message });
            }
        }
    }
};