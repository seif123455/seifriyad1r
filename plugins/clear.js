export default {
    command: 'كليار',
    aliases: ['clr', 'clean', 'clear'],
    category: 'المالك',
    description: '',
    usage: '.مسح',
    ownerOnly: true,
    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        try {
            const sent = await sock.sendMessage(chatId, {
                text: 'Clearing bot messages...',
                ...channelInfo
            });
            await new Promise(resolve => setTimeout(resolve, 1000));
            await sock.sendMessage(chatId, { delete: sent.key });
        }
        catch (error) {
            console.error('Error clearing messages:', error);
            await sock.sendMessage(chatId, {
                text: 'An error occurred while clearing messages.',
                ...channelInfo
            }, { quoted: message });
        }
    }
};



