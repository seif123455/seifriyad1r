import { loadSchedules, saveSchedules } from './schedule.js';
export default {
    command: 'سكهيدوليكانكيل',
    aliases: ['schedcancel', 'cancelschedule', 'unschedule', 'schedulecancel'],
    category: 'مرافق',
    description: 'إلغاء ا جدولةد رسالة بي يتس معرف',
    usage: '.جدولةإلغاء <معرف>',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const senderId = context.senderId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};
        if (!args || args.length === 0) {
            return await sock.sendMessage(chatId, {
                text: 'âŒ Please provide the schedule ID.\n\nUsage: `.جدولةcancel <ID>`\nGet IDs: `.schedulelist`',
                ...channelInfo
            }, { quoted: message });
        }
        const targetId = args[0].toUpperCase();
        const schedules = await loadSchedules();
        const index = schedules.findIndex(s => s.id === targetId && (s.chatId === chatId || s.senderId === senderId));
        if (index === -1) {
            return await sock.sendMessage(chatId, {
                text: `âŒ No scheduled message found with ID *${targetId}*\n\nUse \`.schedulelist\` to see your scheduled messages.`,
                ...channelInfo
            }, { quoted: message });
        }
        const cancelled = schedules.splice(index, 1)[0];
        await saveSchedules(schedules);
        await sock.sendMessage(chatId, {
            text: `ðŸ—‘ï¸ *Schedule Cancelled!*\n\nðŸ“Œ *ID:* ${cancelled.id}\nðŸ’¬ *Message:* ${cancelled.message}`,
            ...channelInfo
        }, { quoted: message });
    }
};




