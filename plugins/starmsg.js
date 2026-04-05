export default {
    command: 'ستار',
    aliases: ['starmsg', 'unstar', 'unstarmsg', 'star'],
    category: 'المالك',
    description: 'ستار ور ونستار ا ريبلييد رسالة',
    usage: '.ستار â€” رد تو ا رسالة | .ونستار â€” رد تو ا رسالة',
    ownerOnly: true,
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};
        const rawText = (context.rawText || '').toLowerCase();
        const shouldStar = !rawText.startsWith('.unstar');
        // contextInfo can be nested in any message type
        const msg = message.message;
        const contextInfo = msg?.extendedTextMessage?.contextInfo ||
            msg?.imageMessage?.contextInfo ||
            msg?.videoMessage?.contextInfo ||
            msg?.audioMessage?.contextInfo ||
            msg?.documentMessage?.contextInfo ||
            msg?.stickerMessage?.contextInfo ||
            msg?.buttonsResponseMessage?.contextInfo ||
            null;
        if (!contextInfo?.stanzaId) {
            return await sock.sendMessage(chatId, {
                text: `*â­ STAR MESSAGE*\n\n_Reply to any message with:_\nâ€¢ \`.star\` â€” to star it\nâ€¢ \`.unstar\` â€” to unstar it`,
                ...channelInfo
            }, { quoted: message });
        }
        const targetId = contextInfo.stanzaId;
        // Determine fromMe: compare phone numbers only (strip :xx@suffix)
        const botNum = (sock.user?.id || '').split(':')[0].split('@')[0];
        const participantNum = (contextInfo.participant || '').split(':')[0].split('@')[0];
        const fromMe = participantNum ? participantNum === botNum : message.key.fromMe;
        try {
            await sock.chatModify({
                star: {
                    messages: [{ id: targetId, fromMe }],
                    star: shouldStar
                }
            }, chatId);
            await sock.sendMessage(chatId, {
                text: shouldStar ? `â­ *Message starred!*` : `âœ´ï¸ *Message unstarred!*`,
                ...channelInfo
            }, { quoted: message });
        }
        catch (e) {
            console.error('[STARMSG] Error:', e.message);
            await sock.sendMessage(chatId, {
                text: `âŒ Failed to ${shouldStar ? 'star' : 'unstar'} message: ${e.message}`,
                ...channelInfo
            }, { quoted: message });
        }
    }
};



