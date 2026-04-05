import { loadSchedules, formatTimeLeft } from './schedule.js';
export default {
    command: 'سكهيدوليليست',
    aliases: ['schedlist', 'schedules', 'reminders', 'schedulelist'],
    category: 'مرافق',
    description: 'عرض الل جدولةد رسالةس لهذه المحادثة',
    usage: '.جدولةقائمة',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const senderId = context.senderId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};
        const schedules = await loadSchedules();
        // Show schedules for this chat
        const mine = schedules.filter(s => s.chatId === chatId || s.senderId === senderId);
        if (mine.length === 0) {
            return await sock.sendMessage(chatId, {
                text: 'ðŸ“­ *No scheduled messages found*\n\nUse `.schedule <time> <message>` to schedule one!',
                ...channelInfo
            }, { quoted: message });
        }
        const now = Date.now();
        const lines = mine.map((s, i) => {
            const timeLeft = formatTimeLeft(s.sendAt - now);
            const preview = s.message.length > 40
                ? `${s.message.substring(0, 40) }...`
                : s.message;
            return `${i + 1}. ðŸ“Œ *ID:* ${s.id} | â³ ${timeLeft}\n    ðŸ’¬ ${preview}`;
        }).join('\n\n');
        await sock.sendMessage(chatId, {
            text: `*â° SCHEDULED MESSAGES (${mine.length})*\n\n${lines}\n\n_Use .schedulecancel <ID> to cancel_`,
            ...channelInfo
        }, { quoted: message });
    }
};




