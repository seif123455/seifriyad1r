export default {
    command: 'كتم',
    aliases: ['unmute', 'unsilence', 'الغاء_الكتم', 'فتح_المجموعة'],
    category: 'admin',
    description: 'إلغاء كتم المجموعة (السماح للأعضاء بالكتابة)',
    usage: '!كتم',
    groupOnly: true,
    adminOnly: true,
    
    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        
        try {
            await sock.groupSettingUpdate(chatId, 'not_announcement');
            await sock.sendMessage(chatId, {
                text: '🔓 *تم إلغاء كتم المجموعة*\n\nيمكن لجميع الأعضاء الآن إرسال الرسائل.\n\n🔥 *CRAZY-SEIF BOT* | 📞 201144534147',
                ...channelInfo
            }, { quoted: message });
        } catch (error) {
            console.error('خطأ في إلغاء كتم المجموعة:', error);
            await sock.sendMessage(chatId, {
                text: '❌ فشل في إلغاء كتم المجموعة. تأكد من أن البوت أدمن.',
                ...channelInfo
            }, { quoted: message });
        }
    }
};