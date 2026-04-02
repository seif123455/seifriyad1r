import { initConfig, saveConfig } from './autoreply.js';

export default {
    command: 'رد',
    aliases: ['addreply', 'newtrigger', 'setreply', 'اضافة_رد', 'رد_تلقائي'],
    category: 'owner',
    description: 'إضافة رد تلقائي',
    usage: 'رد <المشغل> | <الرد>\nللمطابقة التامة: رد exact:<المشغل> | <الرد>\nاستخدم {name} لذكر اسم المرسل',
    ownerOnly: true,
    
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const senderId = context.senderId || message.key.remoteJid;
        const fullText = args.join(' ');
        const pipeIndex = fullText.indexOf('|');
        
        if (!fullText || pipeIndex === -1) {
            return await sock.sendMessage(chatId, {
                text: `*➕ إضافة رد تلقائي*\n\n` +
                    `*الاستخدام:*\n` +
                    `\`رد <المشغل> | <الرد>\`\n\n` +
                    `*أمثلة:*\n` +
                    `• \`رد مرحبا | أهلاً بك! 👋\`\n` +
                    `• \`رد exact:صباح الخير | صباح النور! ☀️\`\n` +
                    `• \`رد مرحبا | مرحباً {name}! كيف حالك؟\``
            }, { quoted: message });
        }
        
        let trigger = fullText.substring(0, pipeIndex).trim();
        const response = fullText.substring(pipeIndex + 1).trim();
        
        if (!trigger || !response) {
            return await sock.sendMessage(chatId, {
                text: '❌ المشغل والرد مطلوبان.'
            }, { quoted: message });
        }
        
        let exactMatch = false;
        if (trigger.toLowerCase().startsWith('exact:')) {
            exactMatch = true;
            trigger = trigger.substring(6).trim();
        }
        
        const config = await initConfig();
        const exists = config.replies.find(r => r.trigger === trigger.toLowerCase());
        
        if (exists) {
            return await sock.sendMessage(chatId, {
                text: `⚠️ الرد لـ *"${trigger}"* موجود بالفعل!`
            }, { quoted: message });
        }
        
        config.replies.push({
            trigger: trigger.toLowerCase(),
            response,
            exactMatch,
            addedBy: senderId,
            createdAt: Date.now()
        });
        
        await saveConfig(config);
        
        await sock.sendMessage(chatId, {
            text: `✅ *تم إضافة الرد التلقائي!*\n\n` +
                `🔑 *المشغل:* ${trigger}\n` +
                `🎯 *المطابقة:* ${exactMatch ? 'تامة' : 'احتواء'}\n` +
                `💬 *الرد:* ${response}`
        }, { quoted: message });
    }
};