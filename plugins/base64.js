export default {
    command: 'باسي64',
    aliases: ['b64', 'encode', 'base64'],
    category: 'أدوات',
    description: '',
    usage: '.باسي64 <نص> ور رد تو ا رسالة',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        try {
            let txt = args?.join(' ') || "";
            const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (quoted) {
                txt = quoted.conversation ||
                    quoted.extendedTextMessage?.text ||
                    quoted.imageMessage?.caption ||
                    quoted.videoMessage?.caption ||
                    txt;
            }
            txt = txt.replace(/^\.\w+\s*/, '').trim();
            if (!txt) {
                return await sock.sendMessage(chatId, { text: '*Please provide text to encode or reply to a message.*\nExample: .base64 Hello World' }, { quoted: message });
            }
            const encoded = Buffer.from(txt, 'utf-8').toString('base64');
            const response = `*ðŸ”— Base64 Encoded:*\n\n${encoded}`;
            await sock.sendMessage(chatId, { text: response }, { quoted: message });
        }
        catch (err) {
            console.error('Base64 plugin error:', err);
            await sock.sendMessage(chatId, { text: 'âŒ Failed to encode text.' }, { quoted: message });
        }
    }
};




