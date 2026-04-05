export default {
    command: 'جوينجرووب',
    aliases: ['join', 'gcjoin', 'groupinfo', 'joingroup'],
    category: 'المالك',
    description: 'جوين ا مجموعة فيا ينفيتي رابط ور جلب مجموعة معلومات فروم رابط',
    usage: '.جوينمجموعة <رابط ور كود>\ن.مجموعةمعلومات <رابط ور كود>',
    ownerOnly: true,
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};
        const rawText = (context.rawText || '').toLowerCase();
        const isInfo = rawText.startsWith('.groupinfo');
        const input = args[0];
        if (!input) {
            return await sock.sendMessage(chatId, {
                text: `*${isInfo ? 'ðŸ” GROUP INFO' : 'ðŸšª JOIN GROUP'}*\n\n` +
                    `*Usage:*\n` +
                    `â€¢ \`.joingroup https://chat.whatsapp.com/XXXX\`\n` +
                    `â€¢ \`.joingroup XXXX\` (code only)\n` +
                    `â€¢ \`.groupinfo https://chat.whatsapp.com/XXXX\` â€” get info without joining`,
                ...channelInfo
            }, { quoted: message });
        }
        // Extract code from full link or use directly
        const code = input.replace('https://chat.whatsapp.com/', '').trim();
        try {
            if (isInfo) {
                const info = await sock.groupGetInviteInfo(code);
                const members = info.participants?.length || 0;
                return await sock.sendMessage(chatId, {
                    text: `â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—\n` +
                        `â•‘    ðŸ” *GROUP INFO*       â•‘\n` +
                        `â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•\n\n` +
                        `*Name:* ${info.subject || 'Unknown'}\n` +
                        `*Description:* ${info.desc || 'None'}\n` +
                        `*Members:* ${members}\n` +
                        `*Created:* ${info.creation ? new Date(info.creation * 1000).toLocaleDateString() : 'Unknown'}\n` +
                        `*JID:* \`${info.id}\``,
                    ...channelInfo
                }, { quoted: message });
            }
            else {
                const response = await sock.groupAcceptInvite(code);
                return await sock.sendMessage(chatId, {
                    text: `âœ… *Joined group successfully!*\n\nJID: \`${response}\``,
                    ...channelInfo
                }, { quoted: message });
            }
        }
        catch (e) {
            console.error('[JOINGROUP] Error:', e.message);
            await sock.sendMessage(chatId, {
                text: `âŒ Failed: ${e.message}`,
                ...channelInfo
            }, { quoted: message });
        }
    }
};




