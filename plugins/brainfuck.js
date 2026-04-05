export default {
    command: 'براينفوكك',
    aliases: ['bfcode', 'obfuscate', 'brainfuck'],
    category: 'أدوات',
    description: '',
    usage: '.براينفوكك <نص> ور رد تو ا رسالة',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        try {
            let text = args?.join(' ') || "";
            const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (quoted) {
                text = quoted.conversation ||
                    quoted.extendedTextMessage?.text ||
                    quoted.imageMessage?.caption ||
                    quoted.videoMessage?.caption ||
                    text;
            }
            text = text.replace(/^\.\w+\s*/, '').trim();
            if (!text) {
                return await sock.sendMessage(chatId, { text: '*Please provide text or reply to a message to obfuscate!*' }, { quoted: message });
            }
            let bfCode = "";
            let lastAscii = 0;
            for (let i = 0; i < text.length; i++) {
                const ascii = text.charCodeAt(i);
                const diff = ascii - lastAscii;
                if (diff > 0) {
                    bfCode += "+".repeat(diff);
                }
                else if (diff < 0) {
                    bfCode += "-".repeat(Math.abs(diff));
                }
                bfCode += ".";
                lastAscii = ascii;
            }
            const response = `*â„ï¸ Brainfuck Obfuscated Text:*\n\n${bfCode}`;
            await sock.sendMessage(chatId, { text: response }, { quoted: message });
        }
        catch (err) {
            console.error('BF Encoding Error:', err);
            await sock.sendMessage(chatId, { text: 'âŒ Error generating code.' }, { quoted: message });
        }
    }
};




