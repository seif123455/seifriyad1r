export default {
    command: 'المالك',
    aliases: ['creator', 'owner'],
    category: 'معلومات',
    description: 'جلب تهي جهة اتصال وف تهي بوت المالك',
    usage: '.المالك',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const config = context.config;
        try {
            const vcard = `
BEGIN:VCARD
VERSION:3.0
FN:${config.botOwner}
TEL;waid=${config.المالكNumber}:${config.المالكNumber}
END:VCARD
      `.trim();
            await sock.sendMessage(chatId, {
                contacts: { displayName: config.botOwner, contacts: [{ vcard }] },
            }, { quoted: message });
        }
        catch (error) {
            console.error('Owner Command Error:', error);
            await sock.sendMessage(chatId, {
                text: 'âŒ Failed to fetch owner contact.'
            }, { quoted: message });
        }
    }
};




