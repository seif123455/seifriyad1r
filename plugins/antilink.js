import store from '../lib/lightweight_store.js';
import isOwnerOrSudo from '../lib/isOwner.js';
import isAdmin from '../lib/isAdmin.js';

async function setAntilink(chatId, type, action) {
    try {
        await store.saveSetting(chatId, 'antilink', {
            enabled: true,
            action,
            type
        });
        return true;
    } catch (error) {
        console.error('Ø®Ø·Ø£ ÙÙŠ Ø­ÙØ¸ Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ù…Ù†Ø¹ Ø§Ù„Ø±ÙˆØ§Ø¨Ø·:', error);
        return false;
    }
}

async function getAntilink(chatId, _type) {
    try {
        const settings = await store.getSetting(chatId, 'antilink');
        return settings || null;
    } catch (error) {
        console.error('Ø®Ø·Ø£ ÙÙŠ Ø¬Ù„Ø¨ Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ù…Ù†Ø¹ Ø§Ù„Ø±ÙˆØ§Ø¨Ø·:', error);
        return null;
    }
}

async function removeAntilink(chatId, _type) {
    try {
        await store.saveSetting(chatId, 'antilink', {
            enabled: false,
            action: null,
            type: null
        });
        return true;
    } catch (error) {
        console.error('Ø®Ø·Ø£ ÙÙŠ Ø¥Ù„ØºØ§Ø¡ Ù…Ù†Ø¹ Ø§Ù„Ø±ÙˆØ§Ø¨Ø·:', error);
        return false;
    }
}

export async function handleLinkDetection(sock, chatId, message, userMessage, senderId) {
    try {
        const config = await getAntilink(chatId, 'on');
        if (!config?.enabled) return;

        const isOwnerSudo = await isOwnerOrSudo(senderId, sock, chatId);
        if (isOwnerSudo) return;

        try {
            const { isSenderAdmin } = await isAdmin(sock, chatId, senderId);
            if (isSenderAdmin) return;
        } catch (e) {}

        const action = config.action || 'delete';
        let shouldAct = false;
        let linkType = '';

        const linkPatterns = {
            whatsappGroup: /chat\.whatsapp\.com\/[A-Za-z0-9]{20,}/i,
            whatsappChannel: /wa\.me\/channel\/[A-Za-z0-9]{20,}/i,
            telegram: /t\.me\/[A-Za-z0-9_]+/i,
            allLinks: /https?:\/\/\S+|www\.\S+|(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/\S*)?/i,
        };

        if (linkPatterns.whatsappGroup.test(userMessage)) {
            shouldAct = true;
            linkType = 'Ø±Ø§Ø¨Ø· Ø¬Ø±ÙˆØ¨ ÙˆØ§ØªØ³Ø§Ø¨';
        } else if (linkPatterns.whatsappChannel.test(userMessage)) {
            shouldAct = true;
            linkType = 'Ø±Ø§Ø¨Ø· Ù‚Ù†Ø§Ø© ÙˆØ§ØªØ³Ø§Ø¨';
        } else if (linkPatterns.telegram.test(userMessage)) {
            shouldAct = true;
            linkType = 'Ø±Ø§Ø¨Ø· ØªÙŠÙ„ÙŠØ¬Ø±Ø§Ù…';
        } else if (linkPatterns.allLinks.test(userMessage)) {
            shouldAct = true;
            linkType = 'Ø±Ø§Ø¨Ø·';
        }

        if (!shouldAct) return;

        const messageId = message.key.id;
        const participant = message.key.participant || senderId;

        if (action === 'delete' || action === 'kick') {
            try {
                await sock.sendMessage(chatId, {
                    delete: {
                        remoteJid: chatId,
                        fromMe: false,
                        id: messageId,
                        participant
                    }
                });
            } catch (error) {
                console.error('ÙØ´Ù„ Ø­Ø°Ù Ø§Ù„Ø±Ø³Ø§Ù„Ø©:', error);
            }
        }

        if (action === 'warn' || action === 'delete') {
            await sock.sendMessage(chatId, {
                text: `âš ï¸ *ØªØ­Ø°ÙŠØ±*\n\n@${senderId.split('@')[0]}ØŒ Ù…Ù…Ù†ÙˆØ¹ Ø¥Ø±Ø³Ø§Ù„ ${linkType}!`,
                mentions: [senderId]
            });
        }

        if (action === 'kick') {
            try {
                await sock.groupParticipantsUpdate(chatId, [senderId], 'remove');
                await sock.sendMessage(chatId, {
                    text: `ðŸš« ØªÙ… Ø·Ø±Ø¯ @${senderId.split('@')[0]} Ø¨Ø³Ø¨Ø¨ Ø¥Ø±Ø³Ø§Ù„ ${linkType}`,
                    mentions: [senderId]
                });
            } catch (error) {
                console.error('ÙØ´Ù„ Ø·Ø±Ø¯ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…:', error);
                await sock.sendMessage(chatId, {
                    text: `âš ï¸ ÙØ´Ù„ ÙÙŠ Ø·Ø±Ø¯ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ØŒ ØªØ£ÙƒØ¯ Ø¥Ù† Ø§Ù„Ø¨ÙˆØª Ø£Ø¯Ù…Ù†`
                });
            }
        }

    } catch (error) {
        console.error('Ø®Ø·Ø£ ÙÙŠ ÙƒØ´Ù Ø§Ù„Ø±ÙˆØ§Ø¨Ø·:', error);
    }
}

export default {
    command: 'Ù…Ù†Ø¹ Ø±ÙˆØ§Ø¨Ø·',
    aliases: ['antilink', 'alink', 'linkblock', 'Ø±Ø§Ø¨Ø·', 'Ù…Ù†Ø¹_Ø§Ù„Ø±ÙˆØ§Ø¨Ø·'],
    category: 'Ø§Ù„Ù…Ø´Ø±ÙÙˆÙ†',
    description: 'Ù…Ù†Ø¹ Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø±ÙˆØ§Ø¨Ø· ÙÙŠ Ø§Ù„Ø¬Ø±ÙˆØ¨',
    usage: '!Ù…Ù†Ø¹ Ø±ÙˆØ§Ø¨Ø· <ÙˆÙ†|ÙˆÙÙ|ØªØ¹ÙŠÙŠÙ†>',
    groupOnly: true,
    adminOnly: true,

    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const action = args[0]?.toLowerCase();

        if (!action) {
            const config = await getAntilink(chatId, 'on');
            await sock.sendMessage(chatId, {
                text:
`ðŸ”— *Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ù…Ù†Ø¹ Ø§Ù„Ø±ÙˆØ§Ø¨Ø·*

ðŸ“Š Ø§Ù„Ø­Ø§Ù„Ø©: ${config?.enabled ? 'Ù…ÙØ¹Ù„ âœ…' : 'Ù…ØªÙˆÙ‚Ù âŒ'}
âš™ï¸ Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡: ${config?.action || 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯'}

ðŸ“Œ Ø§Ù„Ø£ÙˆØ§Ù…Ø±:
â€¢ \`!Ù…Ù†Ø¹ Ø±ÙˆØ§Ø¨Ø· on\` â†’ ØªØ´ØºÙŠÙ„
â€¢ \`!Ù…Ù†Ø¹ Ø±ÙˆØ§Ø¨Ø· off\` â†’ Ø¥ÙŠÙ‚Ø§Ù
â€¢ \`!Ù…Ù†Ø¹ Ø±ÙˆØ§Ø¨Ø· set delete\` â†’ Ø­Ø°Ù Ø§Ù„Ø±Ø§Ø¨Ø·
â€¢ \`!Ù…Ù†Ø¹ Ø±ÙˆØ§Ø¨Ø· set kick\` â†’ Ø·Ø±Ø¯ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…
â€¢ \`!Ù…Ù†Ø¹ Ø±ÙˆØ§Ø¨Ø· set warn\` â†’ ØªØ­Ø°ÙŠØ± ÙÙ‚Ø·

ðŸ”’ Ø§Ù„Ø±ÙˆØ§Ø¨Ø· Ø§Ù„Ù…Ø­Ù…ÙŠØ©:
â€¢ Ø¬Ø±ÙˆØ¨Ø§Øª ÙˆØ§ØªØ³Ø§Ø¨
â€¢ Ù‚Ù†ÙˆØ§Øª ÙˆØ§ØªØ³Ø§Ø¨
â€¢ ØªÙŠÙ„ÙŠØ¬Ø±Ø§Ù…
â€¢ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø±ÙˆØ§Ø¨Ø·

ðŸ‘‘ Ø§Ù„Ø£Ø¯Ù…Ù† ÙˆØ§Ù„Ù…Ø§Ù„Ùƒ Ù…Ø³ØªØ«Ù†ÙŠÙ†`
            }, { quoted: message });
            return;
        }

        switch (action) {
            case 'on':
                const existingConfig = await getAntilink(chatId, 'on');
                if (existingConfig?.enabled) {
                    await sock.sendMessage(chatId, {
                        text: 'âš ï¸ Ø§Ù„Ù†Ø¸Ø§Ù… Ù…ÙØ¹Ù„ Ø¨Ø§Ù„ÙØ¹Ù„'
                    }, { quoted: message });
                    return;
                }

                const result = await setAntilink(chatId, 'on', 'delete');
                await sock.sendMessage(chatId, {
                    text: result
                        ? 'âœ… ØªÙ… ØªØ´ØºÙŠÙ„ Ù…Ù†Ø¹ Ø§Ù„Ø±ÙˆØ§Ø¨Ø·\nðŸ“Œ Ø§Ù„ÙˆØ¶Ø¹ Ø§Ù„Ø§ÙØªØ±Ø§Ø¶ÙŠ: Ø­Ø°Ù'
                        : 'âŒ ÙØ´Ù„ ÙÙŠ Ø§Ù„ØªØ´ØºÙŠÙ„'
                }, { quoted: message });
                break;

            case 'off':
                await removeAntilink(chatId, 'on');
                await sock.sendMessage(chatId, {
                    text: 'âŒ ØªÙ… Ø¥ÙŠÙ‚Ø§Ù Ù…Ù†Ø¹ Ø§Ù„Ø±ÙˆØ§Ø¨Ø·'
                }, { quoted: message });
                break;

            case 'set':
                if (args.length < 2) {
                    await sock.sendMessage(chatId, {
                        text: 'âŒ Ø­Ø¯Ø¯ Ù†ÙˆØ¹ Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡\nÙ…Ø«Ø§Ù„: `!Ù…Ù†Ø¹ Ø±ÙˆØ§Ø¨Ø· set delete`'
                    }, { quoted: message });
                    return;
                }

                const setAction = args[1].toLowerCase();

                if (!['delete', 'kick', 'warn'].includes(setAction)) {
                    await sock.sendMessage(chatId, {
                        text: 'âŒ Ø§Ø®ØªÙŠØ§Ø± ØºÙŠØ± ØµØ­ÙŠØ­ (delete / kick / warn)'
                    }, { quoted: message });
                    return;
                }

                await setAntilink(chatId, 'on', setAction);

                await sock.sendMessage(chatId, {
                    text: `âœ… ØªÙ… Ø§Ù„ØªØºÙŠÙŠØ± Ø¥Ù„Ù‰: ${setAction === 'delete' ? 'Ø­Ø°Ù' : setAction === 'kick' ? 'Ø·Ø±Ø¯' : 'ØªØ­Ø°ÙŠØ±'}`
                }, { quoted: message });
                break;

            default:
                await sock.sendMessage(chatId, {
                    text: 'âŒ Ø£Ù…Ø± ØºÙŠØ± ØµØ­ÙŠØ­\nØ§ÙƒØªØ¨ `!Ù…Ù†Ø¹ Ø±ÙˆØ§Ø¨Ø·` Ù„Ù„Ù…Ø³Ø§Ø¹Ø¯Ø©'
                }, { quoted: message });
        }
    },

    handleLinkDetection,
    setAntilink,
    getAntilink,
    removeAntilink
};

