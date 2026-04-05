export default {
    command: 'بروادكاستدم',
    aliases: ['bcdm', 'announcedm', 'dmall', 'broadcastdm'],
    category: 'المالك',
    description: '',
    usage: '.بروادكاستدم <رسالة>',
    ownerOnly: true,
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};
        const text = args.join(' ').trim();
        if (!text) {
            return await sock.sendMessage(chatId, {
                text: `*ðŸ“© BROADCAST DM*\n\n*Usage:* .broadcastdm <رسالة>\n\n*Example:*\n.broadcastdm Hey! Check out our new features!\n\n_Sends to all contacts in the bot's contact list. Has a 1.5s delay between each to avoid ban._`,
                ...channelInfo
            }, { quoted: message });
        }
        let contacts = [];
        try {
            const allContacts = Object.keys(sock.store?.contacts || {});
            contacts = allContacts.filter(jid => jid.endsWith('@s.whatsapp.net') &&
                jid !== sock.user?.id);
        }
        catch (e) {
            console.error('[BROADCASTDM] Error getting contacts:', e.message);
        }
        if (contacts.length === 0) {
            return await sock.sendMessage(chatId, {
                text: 'âŒ No contacts found in the bot\'s contact list.',
                ...channelInfo
            }, { quoted: message });
        }
        await sock.sendMessage(chatId, {
            text: `ðŸ“© *Broadcasting to ${contacts.length} contact(s)...*\n\nThis may take a moment.`,
            ...channelInfo
        }, { quoted: message });
        const broadcastText = `ðŸ“© *MESSAGE*\n\n${text}`;
        let sent = 0;
        let failed = 0;
        for (const contactJid of contacts) {
            try {
                await sock.sendMessage(contactJid, {
                    text: broadcastText,
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363319098372999@newsletter',
                            newsletterName: 'GlobalTechInc',
                            serverMessageId: -1
                        }
                    }
                });
                sent++;
            }
            catch (e) {
                console.error(`[BROADCASTDM] Failed to send to ${contactJid}: ${e.message}`);
                failed++;
            }
            // 1.5 second delay between DMs
            await new Promise(r => setTimeout(r, 1500));
        }
        await sock.sendMessage(chatId, {
            text: `âœ… *DM Broadcast Complete!*\n\nðŸ“¤ Sent: ${sent}\nâŒ Failed: ${failed}\nðŸ“Š Total: ${contacts.length}`,
            ...channelInfo
        }, { quoted: message });
    }
};




