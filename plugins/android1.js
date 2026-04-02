import pkg from 'api-qasim';
const QasimAny = pkg;
import axios from 'axios';

export default {
    command: 'تطبيق',
    aliases: ['apkdl', 'apk', 'an1apk', 'appdl', 'app', 'تحميل_تطبيق'],
    category: 'download',
    description: 'البحث عن تطبيقات APK وتحميلها',
    usage: '!تطبيق <اسم_التطبيق>',
    
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const query = args.join(' ').trim();
        
        try {
            if (!query) {
                return await sock.sendMessage(chatId, { 
                    text: '📱 *تحميل التطبيقات*\n\n' +
                        '*الاستخدام:* `!تطبيق <اسم التطبيق>`\n' +
                        '*مثال:* `!تطبيق واتساب`' 
                }, { quoted: message });
            }
            
            await sock.sendMessage(chatId, { text: '🔎 جاري البحث عن التطبيقات...' }, { quoted: message });
            
            const res = await QasimAny.apksearch(query);
            
            if (!res?.data || !Array.isArray(res.data) || res.data.length === 0) {
                return await sock.sendMessage(chatId, { 
                    text: '❌ لا توجد تطبيقات مطابقة للبحث.' 
                }, { quoted: message });
            }
            
            const results = res.data;
            const first = results[0];
            
            let caption = `📱 *نتائج البحث عن:* *${query}*\n\n`;
            caption += `↩️ *رد برقم التطبيق الذي تريد تحميله*\n\n`;
            
            results.forEach((item, i) => {
                caption +=
                    `*${i + 1}.* ${item.judul}\n` +
                    `👨‍💻 المطور: ${item.dev}\n` +
                    `⭐ التقييم: ${item.rating}\n` +
                    `🔗 الرابط: ${item.link}\n\n`;
            });
            
            const sentMsg = await sock.sendMessage(chatId, { 
                image: { url: first.thumb }, 
                caption 
            }, { quoted: message });
            
            const timeout = setTimeout(async () => {
                sock.ev.off('messages.upsert', listener);
                await sock.sendMessage(chatId, { 
                    text: '⏱ انتهى وقت اختيار التطبيق. يرجى البحث مرة أخرى.' 
                }, { quoted: sentMsg });
            }, 5 * 60 * 1000);
            
            const listener = async ({ messages }) => {
                const m = messages[0];
                if (!m?.message || m.key.remoteJid !== chatId) return;
                
                const ctx = m.message?.extendedTextMessage?.contextInfo;
                if (!ctx?.stanzaId || ctx.stanzaId !== sentMsg.key.id) return;
                
                const replyText = m.message.conversation ||
                    m.message.extendedTextMessage?.text ||
                    '';
                const choice = parseInt(replyText.trim(), 10);
                
                if (isNaN(choice) || choice < 1 || choice > results.length) {
                    return await sock.sendMessage(chatId, { 
                        text: `❌ اختيار غير صحيح. اختر رقم من 1 إلى ${results.length}.` 
                    }, { quoted: m });
                }
                
                clearTimeout(timeout);
                sock.ev.off('messages.upsert', listener);
                
                const selected = results[choice - 1];
                
                await sock.sendMessage(chatId, { 
                    text: `⬇️ جاري تحميل *${selected.judul}*...\n⏱ يرجى الانتظار...` 
                }, { quoted: m });
                
                const apiUrl = `https://discardapi.dpdns.org/api/apk/dl/android1?apikey=guru&url=${encodeURIComponent(selected.link)}`;
                const dlRes = await axios.get(apiUrl);
                const apk = dlRes.data?.result;
                
                if (!apk?.url) {
                    return await sock.sendMessage(chatId, { 
                        text: '❌ فشل الحصول على رابط تحميل التطبيق.' 
                    }, { quoted: m });
                }
                
                const safeName = apk.name.replace(/[^\w.-]/g, '_');
                const apkCaption = `📦 *تم تحميل التطبيق*\n\n` +
                    `📛 الاسم: ${apk.name}\n` +
                    `⭐ التقييم: ${apk.rating}\n` +
                    `📦 الحجم: ${apk.size}\n` +
                    `📱 الأندرويد: ${apk.requirement}\n` +
                    `🧒 الفئة العمرية: ${apk.rated}\n` +
                    `📅 تاريخ النشر: ${apk.published}\n\n` +
                    `📝 الوصف:\n${apk.description}`;
                
                await sock.sendMessage(chatId, { 
                    document: { url: apk.url }, 
                    fileName: `${safeName}.apk`, 
                    mimetype: 'application/vnd.android.package-archive', 
                    caption: apkCaption 
                }, { quoted: m });
            };
            
            sock.ev.on('messages.upsert', listener);
            
        } catch (err) {
            console.error('❌ خطأ في أمر تحميل التطبيقات:', err);
            await sock.sendMessage(chatId, { 
                text: '❌ فشل في معالجة طلب تحميل التطبيق.' 
            }, { quoted: message });
        }
    }
};