import axios from 'axios';

export default {
    command: 'من',
    aliases: ['whois', 'domaininfo', 'معلومات_النطاق', 'نطاق'],
    category: 'info',
    description: 'الحصول على معلومات WHOIS للنطاق',
    usage: '!من <النطاق>',
    
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        let domain = args?.[0]?.trim();
        
        if (!domain) {
            return await sock.sendMessage(chatId, { 
                text: '🌐 *معلومات النطاق (WHOIS)*\n\n' +
                    '*الاستخدام:* `!من <النطاق>`\n' +
                    '*مثال:* `!من google.com`\n' +
                    '*مثال:* `!من youtube.com`' 
            }, { quoted: message });
        }
        
        domain = domain.replace(/^https?:\/\//i, '');
        
        try {
            if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain)) {
                return await sock.sendMessage(chatId, { 
                    text: '❌ النطاق غير صالح.' 
                }, { quoted: message });
            }
            
            const apiUrl = `https://discardapi.dpdns.org/api/tools/whois?apikey=guru&domain=${encodeURIComponent(domain)}`;
            const { data } = await axios.get(apiUrl, { timeout: 10000 });
            
            if (!data?.status || !data.result?.domain) {
                return await sock.sendMessage(chatId, { 
                    text: '❌ لا يمكن جلب معلومات WHOIS للنطاق.' 
                }, { quoted: message });
            }
            
            const { domain: dom, registrar, registrant, technical } = data.result;
            
            const text = `🌐 *معلومات النطاق (WHOIS)*\n\n` +
                `━━━━━━ 📋 النطاق ━━━━━━\n` +
                `• النطاق: ${dom.domain}\n` +
                `• الاسم: ${dom.name}\n` +
                `• الامتداد: .${dom.extension}\n` +
                `• خادم WHOIS: ${dom.whois_server}\n` +
                `• الحالة: ${dom.status?.join(', ') || 'غير معروف'}\n` +
                `• خوادم الأسماء: ${dom.name_servers?.join(', ') || 'غير معروف'}\n` +
                `• تاريخ الإنشاء: ${dom.created_date_in_time || 'غير معروف'}\n` +
                `• آخر تحديث: ${dom.updated_date_in_time || 'غير معروف'}\n` +
                `• تاريخ الانتهاء: ${dom.expiration_date_in_time || 'غير معروف'}\n\n` +
                `━━━━━━ 🏢 المسجل ━━━━━━\n` +
                `• الاسم: ${registrar?.name || 'غير معروف'}\n` +
                `• الهاتف: ${registrar?.phone || 'غير معروف'}\n` +
                `• البريد: ${registrar?.email || 'غير معروف'}\n` +
                `• الموقع: ${registrar?.referral_url || 'غير معروف'}\n\n` +
                `━━━━━━ 👤 المالك ━━━━━━\n` +
                `• المنظمة: ${registrant?.organization || 'غير معروف'}\n` +
                `• الدولة: ${registrant?.country || 'غير معروف'}\n` +
                `• البريد: ${registrant?.email || 'غير معروف'}\n\n` +
                `━━━━━━ ⚙ تقني ━━━━━━\n` +
                `• البريد: ${technical?.email || 'غير معروف'}\n\n` +
                `🔥 *CRAZY-SEIF BOT* | 📞 201144534147`;
            
            await sock.sendMessage(chatId, { text }, { quoted: message });
            
        } catch (error) {
            console.error('خطأ في أمر معلومات النطاق:', error);
            
            if (error.code === 'ECONNABORTED') {
                await sock.sendMessage(chatId, { 
                    text: '❌ انتهت مهلة الطلب. قد تكون واجهة البرمجة بطيئة أو لا يمكن الوصول إليها.' 
                }, { quoted: message });
            } else {
                await sock.sendMessage(chatId, { 
                    text: '❌ فشل في جلب معلومات WHOIS للنطاق.' 
                }, { quoted: message });
            }
        }
    }
};