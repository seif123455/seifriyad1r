export default {
    command: 'خصوصية',
    aliases: ['setprivacy', 'pvcy', 'pri', 'privacy'],
    category: 'قوائم',
    description: 'إدارة الل وهاتسابب خصوصية إعدادات, حظر/إلغاء الحظر مستخدمس',
    usage: '.خصوصية â€” عرض مينو',
    ownerOnly: true,
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};
        const setting = args[0]?.toLowerCase();
        const value = args[1]?.toLowerCase();
        // â”€â”€ No args: show full menu â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        if (!setting) {
            return await sock.sendMessage(chatId, {
                text: `â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—\n` +
                    `â•‘ðŸ”’*PRIVACY SETTING*â•‘\n` +
                    `â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•\n` +
                    `ðŸ“Œ *Usage:* \`.pvcy <set> <val>\`\n\n` +
                    `â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\n` +
                    `*âš™ï¸ PRIVACY CONTROLS*\n\n` +
                    `ðŸ‘ï¸ *lastseen* â€” \`all\` \`contacts\` \`blacklist\` \`none\`\n\n` +
                    `ðŸŸ¢ *online* â€” \`all\` \`match_last_seen\`\n\n` +
                    `ðŸ–¼ï¸ *profile* â€” \`all\` \`contacts\` \`blacklist\` \`none\`\n\n` +
                    `ðŸ“Š *status* â€” \`all\` \`contacts\` \`blacklist\` \`none\`\n\n` +
                    `âœ… *receipts* â€” \`all\` \`none\`\n\n` +
                    `ðŸ‘¥ *groups* â€” \`all\` \`contacts\` \`blacklist\`\n\n` +
                    `â³ *timer* â€” \`off\` \`24h\` \`7d\` \`90d\`\n\n` +
                    `*ðŸš« BLOCK CONTROLS*\n\n` +
                    `ðŸ”´ *block* â€” \`<number>\` or reply to msg\n\n` +
                    `ðŸŸ¢ *unblock* â€” \`<number>\` or reply to msg\n\n` +
                    `ðŸ“‹ *blocklist* â€” view blocked users\n\n` +
                    `*ðŸ“Š INFO*\n` +
                    `ðŸ” *status* â€” view privacy settings\n` +
                    `â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\n\n` +
                    `ðŸ’¡ *Examples:*\n` +
                    `â€º \`.privacy lastseen all\`\n\n` +
                    `â€º \`.privacy receipts none\`\n\n` +
                    `â€º \`.privacy timer 7d\`\n\n` +
                    `â€º \`.privacy block 923001234567\`\n\n` +
                    `â€º \`.privacy blocklist\`\n\n` +
                    `â€º \`.privacy status\``,
                ...channelInfo
            }, { quoted: message });
        }
        // â”€â”€ status: show current privacy settings â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        if (setting === 'status') {
            try {
                const s = await sock.fetchPrivacySettings(true);
                const fmt = (v) => v ? `\`${v}\`` : `\`unknown\``;
                return await sock.sendMessage(chatId, {
                    text: `â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—\n` +
                        `â•‘ðŸ”’*CURRENT PRIVACY*â•‘\n` +
                        `â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•\n\n` +
                        `ðŸ‘ï¸ *Last Seen:* ${fmt(s.last)}\n\n` +
                        `ðŸŸ¢ *Online:* ${fmt(s.online)}\n\n` +
                        `ðŸ–¼ï¸ *Profile Pic:* ${fmt(s.profile)}\n\n` +
                        `ðŸ“Š *Status:* ${fmt(s.status)}\n\n` +
                        `âœ… *Read Receipts:* ${fmt(s.readreceipts)}\n\n` +
                        `ðŸ‘¥ *Groups Add:* ${fmt(s.groupadd)}\n\n` +
                        `_Use \`.pvcy <set> <value>\` to change_`,
                    ...channelInfo
                }, { quoted: message });
            }
            catch (e) {
                return await sock.sendMessage(chatId, { text: `âŒ Failed to fetch settings: ${e.message}`, ...channelInfo }, { quoted: message });
            }
        }
        // â”€â”€ blocklist â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        if (setting === 'blocklist') {
            try {
                const list = await sock.fetchBlocklist();
                if (!list || list.length === 0) {
                    return await sock.sendMessage(chatId, { text: `ðŸ“‹ *Block List*\n\n_No blocked users._`, ...channelInfo }, { quoted: message });
                }
                const entries = list.map((jid, i) => `${i + 1}. +${jid.split('@')[0]}`).join('\n');
                return await sock.sendMessage(chatId, {
                    text: `â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•—\n` +
                        `â•‘ðŸš« *BLOCK LIST*   â•‘\n` +
                        `â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•\n\n` +
                        `${entries}\n\n` +
                        `â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\n` +
                        `*Total:* ${list.length} blocked user(s)`,
                    ...channelInfo
                }, { quoted: message });
            }
            catch (e) {
                return await sock.sendMessage(chatId, { text: `âŒ Failed to fetch block list: ${e.message}`, ...channelInfo }, { quoted: message });
            }
        }
        // â”€â”€ block/unblock â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        if (setting === 'block' || setting === 'unblock') {
            let targetJid = null;
            const quotedParticipant = message.message?.extendedTextMessage?.contextInfo?.participant;
            if (quotedParticipant) {
                const num = quotedParticipant.split('@')[0].split(':')[0];
                targetJid = `${num}@s.whatsapp.net`;
            }
            if (!targetJid && value) {
                const num = value.replace(/[^0-9]/g, '');
                if (num.length >= 7)
                    targetJid = `${num}@s.whatsapp.net`;
            }
            if (!targetJid && !chatId.endsWith('@g.us')) {
                targetJid = chatId;
            }
            if (!targetJid) {
                return await sock.sendMessage(chatId, {
                    text: `âŒ Provide a number or reply to a message.\n\nExample: \`.privacy block 923001234567\``,
                    ...channelInfo
                }, { quoted: message });
            }
            try {
                await sock.updateBlockStatus(targetJid, setting);
                const icon = setting === 'block' ? 'ðŸš«' : 'âœ…';
                const action = setting === 'block' ? 'Blocked' : 'Unblocked';
                return await sock.sendMessage(chatId, {
                    text: `${icon} *${action}* +${targetJid.split('@')[0]}`,
                    ...channelInfo
                }, { quoted: message });
            }
            catch (e) {
                return await sock.sendMessage(chatId, { text: `âŒ Failed to ${setting}: ${e.message}`, ...channelInfo }, { quoted: message });
            }
        }
        // â”€â”€ default disappearing timer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        if (setting === 'timer') {
            const durations = {
                'off': 0, '0': 0,
                '24h': 86400, '1d': 86400,
                '7d': 604800, '1w': 604800,
                '90d': 7776000, '3m': 7776000,
            };
            if (!value || !(value in durations)) {
                return await sock.sendMessage(chatId, {
                    text: `âŒ Choose: \`off\` \`24h\` \`7d\` \`90d\`\n\nExample: \`.privacy timer 7d\``,
                    ...channelInfo
                }, { quoted: message });
            }
            try {
                await sock.updateDefaultDisappearingMode(durations[value]);
                const label = value === 'off' || value === '0' ? 'disabled' : `set to *${value}*`;
                return await sock.sendMessage(chatId, { text: `â³ Default disappearing timer ${label}`, ...channelInfo }, { quoted: message });
            }
            catch (e) {
                return await sock.sendMessage(chatId, { text: `âŒ Failed to set timer: ${e.message}`, ...channelInfo }, { quoted: message });
            }
        }
        // â”€â”€ privacy setting updates â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        const privacySettings = {
            lastseen: { fn: (v) => sock.updateLastSeenPrivacy(v), allowed: ['all', 'contacts', 'contact_blacklist', 'blacklist', 'none'], label: 'Last Seen' },
            online: { fn: (v) => sock.updateOnlinePrivacy(v), allowed: ['all', 'match_last_seen'], label: 'Online Status' },
            profile: { fn: (v) => sock.updateProfilePicturePrivacy(v), allowed: ['all', 'contacts', 'contact_blacklist', 'blacklist', 'none'], label: 'Profile Picture' },
            status: { fn: (v) => sock.updateStatusPrivacy(v), allowed: ['all', 'contacts', 'contact_blacklist', 'blacklist', 'none'], label: 'Status' },
            receipts: { fn: (v) => sock.updateReadReceiptsPrivacy(v), allowed: ['all', 'none'], label: 'Read Receipts' },
            groups: { fn: (v) => sock.updateGroupsAddPrivacy(v), allowed: ['all', 'contacts', 'contact_blacklist', 'blacklist'], label: 'Groups Add' },
        };
        const config = privacySettings[setting];
        if (!config) {
            return await sock.sendMessage(chatId, {
                text: `âŒ Unknown option: *${setting}*\n\nUse \`.privacy\` to see all commands.`,
                ...channelInfo
            }, { quoted: message });
        }
        if (!value || !config.allowed.includes(value)) {
            return await sock.sendMessage(chatId, {
                text: `âŒ Invalid value for *${setting}*\n\nAllowed: ${config.allowed.filter(v => v !== 'contact_blacklist').map(v => `\`${v}\``).join(' ')}`,
                ...channelInfo
            }, { quoted: message });
        }
        const resolvedValue = value === 'blacklist' ? 'contact_blacklist' : value;
        try {
            await config.fn(resolvedValue);
            return await sock.sendMessage(chatId, {
                text: `âœ… *${config.label}* set to \`${value}\``,
                ...channelInfo
            }, { quoted: message });
        }
        catch (e) {
            console.error('[PRIVACY] Error:', e.message);
            return await sock.sendMessage(chatId, {
                text: `âŒ Failed to update ${config.label}: ${e.message}`,
                ...channelInfo
            }, { quoted: message });
        }
    }
};



