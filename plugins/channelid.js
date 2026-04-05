export default {
    command: 'كهاننيليد',
    aliases: ['newsletterid', 'channelid'],
    category: 'عام',
    description: '',
    usage: '.كهاننيليد <رابط>',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        let url = args[0] || "";
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (quoted) {
            url = quoted.conversation || quoted.extendedTextMessage?.text || url;
        }
        if (!url || !url.includes('whatsapp.com/channel/')) {
            return await sock.sendMessage(chatId, {
                text: 'Please provide a valid WhatsApp Channel URL.\n\n*Example:* .channelid https://whatsapp.com/channel/xxxxx'
            }, { quoted: message });
        }
        const code = url.split('/').pop();
        try {
            const metadata = await sock.newsletterMetadata("invite", code);
            const response = `
ðŸ†” *JID:* ${metadata.id}
      `.trim();
            await sock.sendMessage(chatId, { text: response }, { quoted: message });
        }
        catch (err) {
            console.error('Channel ID Error:', err);
            await sock.sendMessage(chatId, {
                text: 'âŒ *Failed to resolve:* This channel might be private, deleted, or the link is invalid.'
            }, { quoted: message });
        }
    }
};




