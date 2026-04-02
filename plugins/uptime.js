/*****************************************************************************
 *                                                                           *
 *                     Developed By CRAZY-SEIF                               *
 *                                                                           *
 *  📞  WhatsApp : 201144534147                                              *
 *                                                                           *
 *    © 2026 CRAZY-SEIF. All rights reserved.                               *
 *                                                                           *
 *    Description: This file is part of the CRAZY-SEIF Bot Project.          *
 *                                                                           *
 *****************************************************************************/
export default {
    command: 'تشغيل',
    aliases: ['uptime', 'runtime', 'حالة_البوت', 'مدة_التشغيل'],
    category: 'general',
    description: 'عرض معلومات حالة البوت ومدة التشغيل',
    usage: '!تشغيل',
    isPrefixless: false,
    
    async handler(sock, message) {
        const chatId = message.key.remoteJid;
        const commandHandler = (await import('../lib/commandHandler.js')).default;
        
        const uptimeMs = process.uptime() * 1000;
        
        const formatUptime = (ms) => {
            const sec = Math.floor(ms / 1000) % 60;
            const min = Math.floor(ms / (1000 * 60)) % 60;
            const hr = Math.floor(ms / (1000 * 60 * 60)) % 24;
            const day = Math.floor(ms / (1000 * 60 * 60 * 24));
            const parts = [];
            if (day) parts.push(`${day} يوم`);
            if (hr) parts.push(`${hr} ساعة`);
            if (min) parts.push(`${min} دقيقة`);
            parts.push(`${sec} ثانية`);
            return parts.join(' ');
        };
        
        const startedAt = new Date(Date.now() - uptimeMs).toLocaleString('ar-EG');
        const ramMb = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
        const commandCount = commandHandler.commands.size;
        
        const text = `🤖 *حالة CRAZY-SEIF BOT*\n\n` +
            `┏━━━━━━━━━━━━━━━━━━━━━━┓\n` +
            `┃ ⏱ *مدة التشغيل:* ${formatUptime(uptimeMs)}\n` +
            `┃ 🚀 *تاريخ البدء:* ${startedAt}\n` +
            `┃ 📦 *عدد الأوامر:* ${commandCount}\n` +
            `┃ 💾 *الذاكرة المستخدمة:* ${ramMb} ميجابايت\n` +
            `┗━━━━━━━━━━━━━━━━━━━━━━┛\n\n` +
            `🔥 *CRAZY-SEIF BOT* | 📞 201144534147`;
        
        await sock.sendMessage(chatId, { text });
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
 *    Description: This file is part of the CRAZY-SEIF Bot Project.          *
 *                                                                           *
 *****************************************************************************/