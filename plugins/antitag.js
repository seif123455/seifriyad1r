import { setAntitag, getAntitag, removeAntitag } from '../lib/index.js';

export async function handleTagDetection(sock, chatId, message, senderId) {
    try {
        const antitagSetting = await getAntitag(chatId, 'on');
        if (!antitagSetting || !antitagSetting.enabled) return;
        
        const mentionedJids = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        const messageText = (message.message?.conversation ||
            message.message?.extendedTextMessage?.text ||
            message.message?.imageMessage?.caption ||
            message.message?.videoMessage?.caption ||
            '');
        const textMentions = messageText.match(/@[\d+\s\-()~.]+/g) || [];
        const numericMentions = messageText.match(/@\d{10,}/g) || [];
        const _allMentions = [...new Set([...mentionedJids, ...textMentions, ...numericMentions])];
        
        const uniqueNumericMentions = new Set();
        numericMentions.forEach((mention) => {
            const numMatch = mention.match(/@(\d+)/);
            if (numMatch) uniqueNumericMentions.add(numMatch[1]);
        });
        
        const mentionedJidCount = mentionedJids.length;
        const numericMentionCount = uniqueNumericMentions.size;
        const totalMentions = Math.max(mentionedJidCount, numericMentionCount);
        
        if (totalMentions >= 3) {
            const groupMetadata = await sock.groupMetadata(chatId);
            const participants = groupMetadata.participants || [];
            const mentionThreshold = Math.ceil(participants.length * 0.5);
            const hasManyNumericMentions = numericMentionCount >= 10 ||
                (numericMentionCount >= 5 && numericMentionCount >= mentionThreshold);
            
            if (totalMentions >= mentionThreshold || hasManyNumericMentions) {
                const action = antitagSetting.action || 'delete';
                
                if (action === 'delete') {
                    await sock.sendMessage(chatId, {
                        delete: {
                            remoteJid: chatId,
                            fromMe: false,
                            id: message.key.id,
                            participant: senderId
                        }
                    });
                    await sock.sendMessage(chatId, {
                        text: `âš ï¸ *ØªÙ… Ø§ÙƒØªØ´Ø§Ù Ù…Ù†Ø´Ù† Ù„Ù„ÙƒÙ„!*\n\n@${senderId.split('@')[0]}, Ù…Ù†Ø´Ù† Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø£Ø¹Ø¶Ø§Ø¡ ØºÙŠØ± Ù…Ø³Ù…ÙˆØ­ Ø¨Ù‡.`,
                        mentions: [senderId]
                    });
                } else if (action === 'kick') {
                    await sock.sendMessage(chatId, {
                        delete: {
                            remoteJid: chatId,
                            fromMe: false,
                            id: message.key.id,
                            participant: senderId
                        }
                    });
                    try {
                        await sock.groupParticipantsUpdate(chatId, [senderId], "remove");
                        await sock.sendMessage(chatId, {
                            text: `ðŸš« *ØªÙ… ØªØ·Ø¨ÙŠÙ‚ Ù…Ù†Ø¹ Ø§Ù„Ù…Ù†Ø´Ù†!*\n\n@${senderId.split('@')[0]} ØªÙ… Ø·Ø±Ø¯Ù‡ Ø¨Ø³Ø¨Ø¨ Ù…Ù†Ø´Ù† Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø£Ø¹Ø¶Ø§Ø¡.`,
                            mentions: [senderId]
                        });
                    } catch (error) {
                        await sock.sendMessage(chatId, {
                            text: `âš ï¸ ÙØ´Ù„ Ø·Ø±Ø¯ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…. ØªØ£ÙƒØ¯ Ù…Ù† Ø£Ù† Ø§Ù„Ø¨ÙˆØª Ø£Ø¯Ù…Ù†.`
                        });
                    }
                }
            }
        }
    } catch (error) {
        console.error('Ø®Ø·Ø£ ÙÙŠ ÙƒØ´Ù Ø§Ù„Ù…Ù†Ø´Ù†:', error);
    }
}

export default {
    command: 'Ù…Ù†Ø´Ù†',
    aliases: ['antitag', 'at', 'tagblock', 'Ù…Ù†Ø¹_Ø§Ù„Ù…Ù†Ø´Ù†'],
    category: 'Ø§Ù„Ù…Ø´Ø±ÙÙˆÙ†',
    description: 'Ù…Ù†Ø¹ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ† Ù…Ù† Ù…Ù†Ø´Ù† Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø£Ø¹Ø¶Ø§Ø¡',
    usage: '!Ù…Ù†Ø´Ù† <ÙˆÙ†|ÙˆÙÙ|ØªØ¹ÙŠÙŠÙ†>',
    groupOnly: true,
    adminOnly: true,
    
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const action = args[0]?.toLowerCase();
        
        if (!action) {
            const config = await getAntitag(chatId, 'on');
            await sock.sendMessage(chatId, {
                text: `*ðŸ·ï¸ Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ù…Ù†Ø¹ Ø§Ù„Ù…Ù†Ø´Ù†*\n\n` +
                    `*Ø§Ù„Ø­Ø§Ù„Ø©:* ${config?.enabled ? 'âœ… Ù…ÙØ¹Ù„' : 'âŒ Ù…Ø¹Ø·Ù„'}\n` +
                    `*Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡:* ${config?.action || 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯'}\n\n` +
                    `*Ø§Ù„Ø£ÙˆØ§Ù…Ø±:*\n` +
                    `â€¢ \`!Ù…Ù†Ø´Ù† on\` - ØªÙØ¹ÙŠÙ„\n` +
                    `â€¢ \`!Ù…Ù†Ø´Ù† off\` - ØªØ¹Ø·ÙŠÙ„\n` +
                    `â€¢ \`!Ù…Ù†Ø´Ù† set delete\` - Ø­Ø°Ù Ø±Ø³Ø§Ø¦Ù„ Ù…Ù†Ø´Ù† Ø§Ù„ÙƒÙ„\n` +
                    `â€¢ \`!Ù…Ù†Ø´Ù† set kick\` - Ø·Ø±Ø¯ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ† Ø§Ù„Ø°ÙŠÙ† ÙŠØ¹Ù…Ù„ÙˆÙ† Ù…Ù†Ø´Ù† Ù„Ù„ÙƒÙ„\n\n` +
                    `*Ø§Ù„ÙƒØ´Ù:*\n` +
                    `â€¢ ÙŠÙƒØ´Ù Ù…Ù†Ø´Ù† 50%+ Ù…Ù† Ø§Ù„Ø£Ø¹Ø¶Ø§Ø¡\n` +
                    `â€¢ ÙŠØ­Ù…ÙŠ Ù…Ù† Ø§Ù„ØªÙƒØ±Ø§Ø± ÙˆØ§Ù„Ø¥Ø²Ø¹Ø§Ø¬`
            }, { quoted: message });
            return;
        }
        
        switch (action) {
            case 'on':
                const existingConfig = await getAntitag(chatId, 'on');
                if (existingConfig?.enabled) {
                    await sock.sendMessage(chatId, {
                        text: 'âš ï¸ *Ù…Ù†Ø¹ Ø§Ù„Ù…Ù†Ø´Ù† Ù…ÙØ¹Ù„ Ø¨Ø§Ù„ÙØ¹Ù„*'
                    }, { quoted: message });
                    return;
                }
                const result = await setAntitag(chatId, 'on', 'delete');
                await sock.sendMessage(chatId, {
                    text: result
                        ? 'âœ… *ØªÙ… ØªÙØ¹ÙŠÙ„ Ù…Ù†Ø¹ Ø§Ù„Ù…Ù†Ø´Ù† Ø¨Ù†Ø¬Ø§Ø­!*\n\nØ§Ù„Ø¥Ø¬Ø±Ø§Ø¡ Ø§Ù„Ø§ÙØªØ±Ø§Ø¶ÙŠ: Ø­Ø°Ù Ø±Ø³Ø§Ø¦Ù„ Ù…Ù†Ø´Ù† Ø§Ù„ÙƒÙ„'
                        : 'âŒ *ÙØ´Ù„ ÙÙŠ ØªÙØ¹ÙŠÙ„ Ù…Ù†Ø¹ Ø§Ù„Ù…Ù†Ø´Ù†*'
                }, { quoted: message });
                break;
                
            case 'off':
                await removeAntitag(chatId, 'on');
                await sock.sendMessage(chatId, {
                    text: 'âŒ *ØªÙ… ØªØ¹Ø·ÙŠÙ„ Ù…Ù†Ø¹ Ø§Ù„Ù…Ù†Ø´Ù†*\n\nÙŠÙ…ÙƒÙ† Ù„Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ† Ø§Ù„Ø¢Ù† Ù…Ù†Ø´Ù† Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø£Ø¹Ø¶Ø§Ø¡.'
                }, { quoted: message });
                break;
                
            case 'set':
                if (args.length < 2) {
                    await sock.sendMessage(chatId, {
                        text: 'âŒ *Ø§Ù„Ø±Ø¬Ø§Ø¡ ØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡*\n\nØ§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…: `!Ù…Ù†Ø´Ù† set delete | kick`'
                    }, { quoted: message });
                    return;
                }
                const setAction = args[1].toLowerCase();
                if (!['delete', 'kick'].includes(setAction)) {
                    await sock.sendMessage(chatId, {
                        text: 'âŒ *Ø¥Ø¬Ø±Ø§Ø¡ ØºÙŠØ± ØµØ­ÙŠØ­*\n\nØ§Ø®ØªØ±: delete Ø£Ùˆ kick'
                    }, { quoted: message });
                    return;
                }
                const setResult = await setAntitag(chatId, 'on', setAction);
                const actionDescriptions = {
                    delete: 'Ø­Ø°Ù Ø±Ø³Ø§Ø¦Ù„ Ù…Ù†Ø´Ù† Ø§Ù„ÙƒÙ„ ÙˆØªØ­Ø°ÙŠØ± Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ†',
                    kick: 'Ø­Ø°Ù Ø§Ù„Ø±Ø³Ø§Ø¦Ù„ ÙˆØ·Ø±Ø¯ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ† Ù…Ù† Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹Ø©'
                };
                await sock.sendMessage(chatId, {
                    text: setResult
                        ? `âœ… *ØªÙ… Ø¶Ø¨Ø· Ø¥Ø¬Ø±Ø§Ø¡ Ù…Ù†Ø¹ Ø§Ù„Ù…Ù†Ø´Ù† Ø¥Ù„Ù‰: ${setAction === 'delete' ? 'Ø­Ø°Ù' : 'Ø·Ø±Ø¯'}*\n\n${actionDescriptions[setAction]}`
                        : 'âŒ *ÙØ´Ù„ ÙÙŠ Ø¶Ø¨Ø· Ø¥Ø¬Ø±Ø§Ø¡ Ù…Ù†Ø¹ Ø§Ù„Ù…Ù†Ø´Ù†*'
                }, { quoted: message });
                break;
                
            case 'status':
            case 'get':
                const status = await getAntitag(chatId, 'on');
                await sock.sendMessage(chatId, {
                    text: `*ðŸ·ï¸ Ø­Ø§Ù„Ø© Ù…Ù†Ø¹ Ø§Ù„Ù…Ù†Ø´Ù†*\n\n` +
                        `*Ø§Ù„Ø­Ø§Ù„Ø©:* ${status?.enabled ? 'âœ… Ù…ÙØ¹Ù„' : 'âŒ Ù…Ø¹Ø·Ù„'}\n` +
                        `*Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡:* ${status?.action === 'delete' ? 'Ø­Ø°Ù' : status?.action === 'kick' ? 'Ø·Ø±Ø¯' : 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯'}\n\n` +
                        `*Ù…Ø§Ø°Ø§ ÙŠØ­Ø¯Ø« Ø¹Ù†Ø¯ Ø§ÙƒØªØ´Ø§Ù Ù…Ù†Ø´Ù† Ø§Ù„ÙƒÙ„:*\n` +
                        `${status?.action === 'delete' ? 'â€¢ ÙŠØªÙ… Ø­Ø°Ù Ø§Ù„Ø±Ø³Ø§Ù„Ø©\nâ€¢ ÙŠØªÙ… ØªØ­Ø°ÙŠØ± Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…' : ''}` +
                        `${status?.action === 'kick' ? 'â€¢ ÙŠØªÙ… Ø­Ø°Ù Ø§Ù„Ø±Ø³Ø§Ù„Ø©\nâ€¢ ÙŠØªÙ… Ø·Ø±Ø¯ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ù…Ù† Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹Ø©' : ''}\n\n` +
                        `*Ø­Ø¯ Ø§Ù„ÙƒØ´Ù:* 50% Ù…Ù† Ø£Ø¹Ø¶Ø§Ø¡ Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹Ø© Ø£Ùˆ 10+ Ù…Ù†Ø´Ù†`
                }, { quoted: message });
                break;
                
            default:
                await sock.sendMessage(chatId, {
                    text: 'âŒ *Ø£Ù…Ø± ØºÙŠØ± ØµØ­ÙŠØ­*\n\nØ§Ø³ØªØ®Ø¯Ù… `!Ù…Ù†Ø´Ù†` Ù„Ø±Ø¤ÙŠØ© Ø§Ù„Ø®ÙŠØ§Ø±Ø§Øª Ø§Ù„Ù…ØªØ§Ø­Ø©.'
                }, { quoted: message });
        }
    },
    handleTagDetection
};

