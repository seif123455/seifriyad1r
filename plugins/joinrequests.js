export default {
    command: 'جوينريقويستس',
    aliases: ['gcreqs', 'groupreqs', 'pendingjoins', 'approvejoin', 'rejectjoin', 'joinrequests'],
    category: 'المجموعة',
    description: 'عرض, موافقة ور رفض مجموعة جوين ريقويستس',
    usage: '.جوينريقويستس â€” عرض بيندينج\ن.اببروفيجوين <رقم|الل>\ن.ريجيكتجوين <رقم|الل>',
    groupOnly: true,
    adminOnly: true,
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};
        const rawText = (context.rawText || '').toLowerCase();
        const isApprove = rawText.startsWith('.approvejoin');
        const isReject = rawText.startsWith('.rejectjoin');
        // List pending requests
        if (!isApprove && !isReject) {
            try {
                const requests = await sock.groupRequestParticipantsList(chatId);
                if (!requests || requests.length === 0) {
                    return await sock.sendMessage(chatId, {
                        text: `ðŸ“‹ *Join Requests*\n\n_No pending join requests._`,
                        ...channelInfo
                    }, { quoted: message });
                }
                const list = requests.map((r, i) => `${i + 1}. +${r.jid.split('@')[0]}`).join('\n');
                return await sock.sendMessage(chatId, {
                    text: `â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—\n` +
                        `â•‘   ðŸ“‹ *JOIN REQUESTS*    â•‘\n` +
                        `â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•\n\n` +
                        `${list}\n\n` +
                        `â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\n` +
                        `*Total:* ${requests.length} pending\n\n` +
                        `â€¢ \`.approvejoin all\` â€” approve all\n` +
                        `â€¢ \`.rejectjoin all\` â€” reject all\n` +
                        `â€¢ \`.approvejoin 923001234567\` â€” approve one`,
                    ...channelInfo
                }, { quoted: message });
            }
            catch (e) {
                return await sock.sendMessage(chatId, {
                    text: `âŒ Failed to fetch requests: ${e.message}`,
                    ...channelInfo
                }, { quoted: message });
            }
        }
        // Approve or reject
        const action = isApprove ? 'approve' : 'reject';
        const input = args[0]?.toLowerCase();
        try {
            let targets = [];
            if (input === 'all') {
                const requests = await sock.groupRequestParticipantsList(chatId);
                if (!requests || requests.length === 0) {
                    return await sock.sendMessage(chatId, {
                        text: `âš ï¸ No pending join requests.`,
                        ...channelInfo
                    }, { quoted: message });
                }
                targets = requests.map((r) => r.jid);
            }
            else if (input) {
                const num = input.replace(/[^0-9]/g, '');
                targets = [`${num}@s.whatsapp.net`];
            }
            else {
                return await sock.sendMessage(chatId, {
                    text: `âŒ Provide a number or \`all\`.\n\nExample: \`.${isApprove ? 'approvejoin' : 'rejectjoin'} all\``,
                    ...channelInfo
                }, { quoted: message });
            }
            await sock.groupRequestParticipantsUpdate(chatId, targets, action);
            const icon = isApprove ? 'âœ…' : 'âŒ';
            const verb = isApprove ? 'Approved' : 'Rejected';
            await sock.sendMessage(chatId, {
                text: `${icon} *${verb}* ${targets.length === 1 ? `+${targets[0].split('@')[0]}` : `${targets.length} request(s)`}`,
                ...channelInfo
            }, { quoted: message });
        }
        catch (e) {
            console.error('[JOINREQUESTS] Error:', e.message);
            await sock.sendMessage(chatId, {
                text: `âŒ Failed to ${action}: ${e.message}`,
                ...channelInfo
            }, { quoted: message });
        }
    }
};



