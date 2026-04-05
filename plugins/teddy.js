const teddyUsers = {};
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
export default {
    command: 'ØªÙŠØ¯Ø¯ÙŠ',
    aliases: ['teddy'],
    category: 'ØªØ³Ù„ÙŠØ©',
    description: 'Ø¥Ø±Ø³Ø§Ù„ Ø§Ù† Ø§Ù†ÙŠÙ…Ø§ØªÙŠØ¯ ØªÙŠØ¯Ø¯ÙŠ ÙˆÙŠØªÙ‡ ÙƒÙˆØªÙŠ ÙŠÙ…ÙˆØ¬ÙŠØ³',
    usage: '.ØªÙŠØ¯Ø¯ÙŠ',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const sender = message.key.participant || message.key.remoteJid;
        if (teddyUsers[sender])
            return;
        teddyUsers[sender] = true;
        const teddyEmojis = [
            'â¤', 'ðŸ’•', 'ðŸ˜»', 'ðŸ§¡', 'ðŸ’›', 'ðŸ’š', 'ðŸ’™', 'ðŸ’œ', 'ðŸ–¤', 'â£',
            'ðŸ’ž', 'ðŸ’“', 'ðŸ’—', 'ðŸ’–', 'ðŸ’˜', 'ðŸ’', 'ðŸ’Ÿ', 'â™¥', 'ðŸ’Œ', 'ðŸ™‚',
            'ðŸ¤—', 'ðŸ˜Œ', 'ðŸ˜‰', 'ðŸ¤—', 'ðŸ˜Š', 'ðŸŽŠ', 'ðŸŽ‰', 'ðŸŽ', 'ðŸŽˆ'
        ];
        try {
            const pingMsg = await sock.sendMessage(chatId, { text: `(\\_/)\n( â€¢.â€¢)\n/>ðŸ¤` }, { quoted: message });
            for (let i = 0; i < teddyEmojis.length; i++) {
                await sleep(500);
                await sock.relayMessage(chatId, {
                    protocolMessage: {
                        key: pingMsg.key,
                        type: 14,
                        editedMessage: {
                            conversation: `(\\_/)\n( â€¢.â€¢)\n/>${teddyEmojis[i]}`
                        }
                    }
                }, {});
            }
        }
        catch (err) {
            console.error('Error in teddy command:', err);
            try {
                await sock.sendMessage(chatId, { text: 'âŒ Something went wrong while sending teddy emojis.' }, { quoted: message });
            }
            catch { }
        }
        finally {
            delete teddyUsers[sender];
        }
    }
};


