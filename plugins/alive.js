/*****************************************************************************
 *                                                                           *
 *                     Developed By CRAZY-SEIF                               *
 *                                                                           *
 *  📞  WhatsApp : 201144534147                                              *
 *                                                                           *
 *    © 2026 CRAZY-SEIF. All rights reserved.                               *
 *                                                                           *
 *****************************************************************************/
import os from 'os';
import process from 'process';

export default {
    command: 'حالة',
    aliases: ['alive', 'status', 'bot', 'رون', 'تشغيل'],
    category: 'general',
    description: 'عرض حالة البوت ومعلومات النظام',
    usage: '!حالة',
    isPrefixless: false,
    
    async handler(sock, message, args, context) {
        const { chatId, config } = context;
        
        try {
            let uptime = Math.floor(process.uptime());
            const days = Math.floor(uptime / 86400);
            uptime %= 86400;
            const hours = Math.floor(uptime / 3600);
            uptime %= 3600;
            const minutes = Math.floor(uptime / 60);
            const seconds = (Number(uptime) % Number(60));
            
            const uptimeParts = [];
            if (days) uptimeParts.push(`${days} يوم`);
            if (hours) uptimeParts.push(`${hours} ساعة`);
            if (minutes) uptimeParts.push(`${minutes} دقيقة`);
            if (seconds || uptimeParts.length === 0) uptimeParts.push(`${seconds} ثانية`);
            
            const uptimeText = uptimeParts.join(' ');
            
            const totalMem = (os.totalmem() / 1024 / 1024).toFixed(2);
            const freeMem = (os.freemem() / 1024 / 1024).toFixed(2);
            const usedMem = (Number(totalMem) - Number(freeMem)).toFixed(2);
            const cpuLoad = os.loadavg()[0].toFixed(2);
            const platform = os.platform();
            const arch = os.arch();
            const nodeVersion = process.version;
            
            const text = 
                `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n` +
                `┃ 🤖 *${config.botName || 'CRAZY-SEIF'} شغال!* \n` +
                `┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫\n` +
                `┃ ⏰ *مدة التشغيل:* ${uptimeText}\n` +
                `┃ 💾 *الذاكرة:* ${usedMem} MB / ${totalMem} MB\n` +
                `┃ 🔥 *تحميل المعالج:* ${cpuLoad}\n` +
                `┃ 💻 *النظام:* ${platform} (${arch})\n` +
                `┃ 📦 *Node.js:* ${nodeVersion}\n` +
                `┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫\n` +
                `┃ 🔥 *CRAZY-SEIF*\n` +
                `┃ 📞 *للتواصل:* 201144534147\n` +
                `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;
            
            await sock.sendMessage(chatId, {
                text,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '201144534147@newsletter',
                        newsletterName: 'CRAZY-SEIF',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
            
        } catch (error) {
            console.error('خطأ في أمر الحالة:', error);
            await sock.sendMessage(chatId, { 
                text: '✅ البوت شغال وبخير! 🔥' 
            }, { quoted: message });
        }
    }
};