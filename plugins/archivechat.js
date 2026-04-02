export default {
    command: 'ارشيف',
    aliases: ['archivechat', 'archive', 'unarchive', 'unarchivechat', 'تخزين', 'ارشفة'],
    category: 'owner',
    description: 'أرشفة أو إلغاء أرشفة المحادثة الحالية',
    usage: '!ارشيف <ارشيف|الغاء>',
    ownerOnly: true,
    
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};
        const rawText = context.rawText || '';
        
        // كشف تلقائي من اسم الأمر
        const isUnarchive = rawText.toLowerCase().startsWith('!الغاء') || 
                           rawText.toLowerCase().startsWith('!unarchive') ||
                           rawText.toLowerCase().startsWith('!unarchivechat');
        
        let action = args[0]?.toLowerCase();
        
        // تحديد الإجراء من الأمر المستخدم
        if (!action) {
            if (isUnarchive) {
                action = 'الغاء';
            } else {
                action = 'ارشيف';
            }
        }
        
        // تحويل الأسماء الإنجليزية
        if (action === 'archive') action = 'ارشيف';
        if (action === 'unarchive') action = 'الغاء';
        
        if (!['ارشيف', 'الغاء'].includes(action)) {
            return await sock.sendMessage(chatId, {
                text: `*📦 أرشفة المحادثة*\n\n*الاستخدام:*\n• \`!ارشيف ارشيف\` — أرشفة هذه المحادثة\n• \`!ارشيف الغاء\` — إلغاء أرشفة هذه المحادثة\n\n*أو استخدم:* \`!ارشيف\` / \`!الغاء\``,
                ...channelInfo
            }, { quoted: message });
        }
        
        const shouldArchive = action === 'ارشيف';
        
        try {
            const lastMsg = message;
            await sock.chatModify({
                archive: shouldArchive,
                lastMessages: [
                    {
                        key: lastMsg.key,
                        messageTimestamp: lastMsg.messageTimestamp
                    }
                ]
            }, chatId);
            
            await sock.sendMessage(chatId, {
                text: shouldArchive
                    ? `📦 *تمت أرشفة المحادثة!*`
                    : `📂 *تم إلغاء أرشفة المحادثة!*`,
                ...channelInfo
            }, { quoted: message });
            
        } catch (e) {
            console.error('[ARCHIVECHAT] خطأ:', e.message);
            await sock.sendMessage(chatId, {
                text: `❌ فشل في ${shouldArchive ? 'أرشفة' : 'إلغاء أرشفة'} المحادثة: ${e.message}`,
                ...channelInfo
            }, { quoted: message });
        }
    }
};