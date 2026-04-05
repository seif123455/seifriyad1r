export default {
    command: 'جيتبب',
    aliases: ['dlpp', 'profilepic', 'getdp', 'getpp'],
    category: 'عام',
    description: 'جلب مستخدم صورة شخصية صورة',
    usage: '.جلببب @مستخدم ور رد ور رقم',
    async handler(sock, message, args, _context) {
        const chatId = message.key.remoteJid;
        const isGroup = chatId.endsWith('@g.us');
        let target;
        let displayName = 'Unknown';
        let displayNumber = '';
        const quoted = message.message?.extendedTextMessage?.contextInfo;
        if (quoted?.mentionedJid?.[0]) {
            target = quoted.mentionedJid[0];
        }
        else if (quoted?.participant) {
            target = quoted.participant;
            if (quoted.pushName)
                displayName = quoted.pushName;
        }
        else if (args[0]) {
            const input = args[0].replace(/[^0-9]/g, '');
            if (input.length >= 10) {
                target = `${input }@s.whatsapp.net`;
                displayName = ''; // Will be resolved later, don't show Unknown
            }
            else {
                return await sock.sendMessage(chatId, {
                    text: 'âŒ Invalid number. Use format: 923051234567 or +923051234567'
                }, { quoted: message });
            }
        }
        else {
            return await sock.sendMessage(chatId, {
                text: 'ðŸ“¸ *Get Profile Picture*\n\nUsage:\nâ€¢ Reply to a message\nâ€¢ Mention someone: `.getpp @user`\nâ€¢ Provide a number: `.getpp 923001234567`'
            }, { quoted: message });
        }
        try {
            let realJid = target;
            if (target.endsWith('@lid') && isGroup) {
                const metadata = await sock.groupMetadata(chatId);
                const participant = metadata.participants.find((p) => p.lid === target || p.id === target);
                if (participant?.id) {
                    realJid = participant.id;
                }
            }
            const cleanNumber = realJid.replace(/@s\.whatsapp\.net|@lid/g, '').split(':')[0];
            // Only show number if it looks like a real phone number (10+ digits)
            displayNumber = cleanNumber.length >= 10 ? `+${cleanNumber}` : '';
            if (displayName === 'Unknown') {
                try {
                    const name = await sock.getName(realJid);
                    if (name && !name.startsWith('+'))
                        displayName = name;
                }
                catch (e) { }
            }
            let ppUrl = null;
            try {
                ppUrl = await sock.profilePictureUrl(realJid, 'image');
            }
            catch (e) {
                return await sock.sendMessage(chatId, {
                    text: `âŒ No profile picture found for *${displayName}* (${displayNumber})`
                }, { quoted: message });
            }
            if (ppUrl) {
                await sock.sendMessage(chatId, {
                    image: { url: ppUrl },
                    caption: `ðŸ“¸ *Profile Picture*${displayName && displayName !== 'Unknown' ? `\n\nðŸ‘¤ *Name:* ${ displayName}` : ''}${displayNumber ? `\nðŸ“± *Number:* ${ displayNumber}` : ''}`
                }, { quoted: message });
            }
        }
        catch (error) {
            console.error('GetPP Error:', error);
            await sock.sendMessage(chatId, {
                text: 'âŒ Failed to fetch profile picture.'
            }, { quoted: message });
        }
    }
};




