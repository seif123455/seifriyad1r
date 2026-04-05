export default {
    command: 'بروادكاست',
    aliases: ['bc', 'announce', 'broadcast'],
    category: 'المالك',
    description: '',
    usage: '.بروادكاست <رسالة>',
    ownerOnly: true,
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};
        const text = args.join(' ').trim();
        if (!text) {
            return await sock.sendMessage(chatId, {
                text: `*ðŸ“¢ BROADCAST*\n\n*Usage:* .broadcast <رسالة>\n\n*Example:*\n.broadcast Hello everyone! Bot will be down for maintenance at 10 PM.\n\n_Sends to all groups the bot is in. Has a 1 second delay between each group to avoid ban._`,
                ...channelInfo
            }, { quoted: message });
        }
        let groups = [];
        try {
            const allChats = Object.keys(sock.store?.chats || {});
            groups = allChats.filter(jid => jid.endsWith('@g.us'));
        }
        catch (e) {
            console.error('[BROADCAST] Error getting groups:', e.message);
        }
        if (groups.length === 0) {
            return await sock.sendMessage(chatId, {
                text: 'âŒ No groups found. Make sure the bot is in at least one group.',
                ...channelInfo
            }, { quoted: message });
        }
        await sock.sendMessage(chatId, {
            text: `ðŸ“¢ *Broadcasting to ${groups.length} group(s)...*\n\nThis may take a moment.`,
            ...channelInfo
        }, { quoted: message });
        const broadcastText = `ðŸ“¢ *BROADCAST MESSAGE*\n\n${text}`;
        let sent = 0;
        let failed = 0;
        for (const groupJid of groups) {
            try {
                await sock.sendMessage(groupJid, {
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
                console.error(`[BROADCAST] Failed to send to ${groupJid}: ${e.message}`);
                failed++;
            }
            // 1 second delay between sends to avoid WhatsApp rate limiting
            await new Promise(r => setTimeout(r, 1000));
        }
        await sock.sendMessage(chatId, {
            text: `âœ… *Broadcast Complete!*\n\nðŸ“¤ Sent: ${sent}\nâŒ Failed: ${failed}\nðŸ“Š Total: ${groups.length}`,
            ...channelInfo
        }, { quoted: message });
    }
};




