import store from '../lib/lightweight_store.js';

async function getAntibadwordSettings(chatId) {
    const settings = await store.getSetting(chatId, 'antibadword');
    return settings || { enabled: false, words: [] };
}

async function saveAntibadwordSettings(chatId, settings) {
    await store.saveSetting(chatId, 'antibadword', settings);
}

async function handleAntiBadwordCommand(sock, chatId, message, match) {
    const args = match.trim().toLowerCase().split(/\s+/);
    const action = args[0];
    const settings = await getAntibadwordSettings(chatId);
    
    if (!action || action === 'status') {
        const status = settings.enabled ? 'âœ… Ù…ÙØ¹Ù„' : 'âŒ Ù…Ø¹Ø·Ù„';
        const wordCount = settings.words?.length || 0;
        await sock.sendMessage(chatId, {
            text: `*ðŸš« Ù…Ù†Ø¹ Ø§Ù„ÙƒÙ„Ù…Ø§Øª Ø§Ù„Ø¨Ø°ÙŠØ¦Ø©*\n\n` +
                `ðŸ“Š *Ø§Ù„Ø­Ø§Ù„Ø©:* ${status}\n` +
                `ðŸ“ *Ø§Ù„ÙƒÙ„Ù…Ø§Øª Ø§Ù„Ù…Ø­Ø¸ÙˆØ±Ø©:* ${wordCount}\n\n` +
                `ðŸ“Œ *Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…:*\n` +
                `â€¢ \`!Ù…Ù†Ø¹ on\` - ØªÙØ¹ÙŠÙ„\n` +
                `â€¢ \`!Ù…Ù†Ø¹ off\` - ØªØ¹Ø·ÙŠÙ„\n` +
                `â€¢ \`!Ù…Ù†Ø¹ add <ÙƒÙ„Ù…Ø©>\` - Ø¥Ø¶Ø§ÙØ© ÙƒÙ„Ù…Ø©\n` +
                `â€¢ \`!Ù…Ù†Ø¹ remove <ÙƒÙ„Ù…Ø©>\` - Ø­Ø°Ù ÙƒÙ„Ù…Ø©\n` +
                `â€¢ \`!Ù…Ù†Ø¹ list\` - Ø¹Ø±Ø¶ Ø§Ù„ÙƒÙ„Ù…Ø§Øª`
        }, { quoted: message });
        return;
    }
    
    if (action === 'on') {
        settings.enabled = true;
        await saveAntibadwordSettings(chatId, settings);
        await sock.sendMessage(chatId, {
            text: 'âœ… *ØªÙ… ØªÙØ¹ÙŠÙ„ Ù…Ù†Ø¹ Ø§Ù„ÙƒÙ„Ù…Ø§Øª Ø§Ù„Ø¨Ø°ÙŠØ¦Ø©*\n\nØ³ÙŠØªÙ… Ø­Ø°Ù Ø£ÙŠ Ø±Ø³Ø§Ù„Ø© ØªØ­ØªÙˆÙŠ Ø¹Ù„Ù‰ ÙƒÙ„Ù…Ø§Øª Ù…Ù…Ù†ÙˆØ¹Ø©.'
        }, { quoted: message });
        return;
    }
    
    if (action === 'off') {
        settings.enabled = false;
        await saveAntibadwordSettings(chatId, settings);
        await sock.sendMessage(chatId, {
            text: 'âŒ *ØªÙ… ØªØ¹Ø·ÙŠÙ„ Ù…Ù†Ø¹ Ø§Ù„ÙƒÙ„Ù…Ø§Øª Ø§Ù„Ø¨Ø°ÙŠØ¦Ø©*\n\nÙ„Ù† ÙŠØªÙ… ÙÙ„ØªØ±Ø© Ø§Ù„Ø±Ø³Ø§Ø¦Ù„.'
        }, { quoted: message });
        return;
    }
    
    if (action === 'add') {
        const word = args.slice(1).join(' ').toLowerCase().trim();
        if (!word) {
            await sock.sendMessage(chatId, {
                text: 'âŒ *Ø§Ù„Ø±Ø¬Ø§Ø¡ ØªØ­Ø¯ÙŠØ¯ Ø§Ù„ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±Ø§Ø¯ Ø¥Ø¶Ø§ÙØªÙ‡Ø§*\n\nÙ…Ø«Ø§Ù„: `!Ù…Ù†Ø¹ add ÙƒÙ„Ù…Ø©`'
            }, { quoted: message });
            return;
        }
        if (!settings.words) settings.words = [];
        if (settings.words.includes(word)) {
            await sock.sendMessage(chatId, {
                text: `âŒ *Ø§Ù„ÙƒÙ„Ù…Ø© Ù…ÙˆØ¬ÙˆØ¯Ø© Ø¨Ø§Ù„ÙØ¹Ù„*\n\n"${word}" Ù…Ø­Ø¸ÙˆØ±Ø© Ø¨Ø§Ù„ÙØ¹Ù„.`
            }, { quoted: message });
            return;
        }
        settings.words.push(word);
        await saveAntibadwordSettings(chatId, settings);
        await sock.sendMessage(chatId, {
            text: `âœ… *ØªÙ… Ø¥Ø¶Ø§ÙØ© Ø§Ù„ÙƒÙ„Ù…Ø©*\n\nØªÙ… Ø¥Ø¶Ø§ÙØ© "${word}" Ø¥Ù„Ù‰ Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„ÙƒÙ„Ù…Ø§Øª Ø§Ù„Ù…Ø­Ø¸ÙˆØ±Ø©.\n\nØ¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„ÙƒÙ„Ù…Ø§Øª Ø§Ù„Ù…Ø­Ø¸ÙˆØ±Ø©: ${settings.words.length}`
        }, { quoted: message });
        return;
    }
    
    if (action === 'remove' || action === 'delete' || action === 'del') {
        const word = args.slice(1).join(' ').toLowerCase().trim();
        if (!word) {
            await sock.sendMessage(chatId, {
                text: 'âŒ *Ø§Ù„Ø±Ø¬Ø§Ø¡ ØªØ­Ø¯ÙŠØ¯ Ø§Ù„ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±Ø§Ø¯ Ø­Ø°ÙÙ‡Ø§*\n\nÙ…Ø«Ø§Ù„: `!Ù…Ù†Ø¹ remove ÙƒÙ„Ù…Ø©`'
            }, { quoted: message });
            return;
        }
        if (!settings.words || !settings.words.includes(word)) {
            await sock.sendMessage(chatId, {
                text: `âŒ *Ø§Ù„ÙƒÙ„Ù…Ø© ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯Ø©*\n\n"${word}" ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯Ø© ÙÙŠ Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„ÙƒÙ„Ù…Ø§Øª Ø§Ù„Ù…Ø­Ø¸ÙˆØ±Ø©.`
            }, { quoted: message });
            return;
        }
        settings.words = settings.words.filter((w) => w !== word);
        await saveAntibadwordSettings(chatId, settings);
        await sock.sendMessage(chatId, {
            text: `âœ… *ØªÙ… Ø­Ø°Ù Ø§Ù„ÙƒÙ„Ù…Ø©*\n\nØªÙ… Ø­Ø°Ù "${word}" Ù…Ù† Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„ÙƒÙ„Ù…Ø§Øª Ø§Ù„Ù…Ø­Ø¸ÙˆØ±Ø©.\n\nØ§Ù„ÙƒÙ„Ù…Ø§Øª Ø§Ù„Ù…ØªØ¨Ù‚ÙŠØ©: ${settings.words.length}`
        }, { quoted: message });
        return;
    }
    
    if (action === 'list') {
        if (!settings.words || settings.words.length === 0) {
            await sock.sendMessage(chatId, {
                text: 'ðŸ“ *Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„ÙƒÙ„Ù…Ø§Øª Ø§Ù„Ù…Ø­Ø¸ÙˆØ±Ø©*\n\nÙ„Ø§ ØªÙˆØ¬Ø¯ ÙƒÙ„Ù…Ø§Øª Ù…Ø­Ø¸ÙˆØ±Ø© Ø­Ø§Ù„ÙŠØ§Ù‹.\n\nØ§Ø³ØªØ®Ø¯Ù… `!Ù…Ù†Ø¹ add <ÙƒÙ„Ù…Ø©>` Ù„Ø¥Ø¶Ø§ÙØ© ÙƒÙ„Ù…Ø§Øª.'
            }, { quoted: message });
            return;
        }
        const wordList = settings.words.map((w, i) => `${i + 1}. ${w}`).join('\n');
        await sock.sendMessage(chatId, {
            text: `ðŸ“ *Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„ÙƒÙ„Ù…Ø§Øª Ø§Ù„Ù…Ø­Ø¸ÙˆØ±Ø©*\n\n${wordList}\n\nðŸ“Š Ø§Ù„Ø¥Ø¬Ù…Ø§Ù„ÙŠ: ${settings.words.length} ÙƒÙ„Ù…Ø©`
        }, { quoted: message });
        return;
    }
    
    await sock.sendMessage(chatId, {
        text: 'âŒ *Ø¥Ø¬Ø±Ø§Ø¡ ØºÙŠØ± ØµØ­ÙŠØ­*\n\nØ§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…:\n' +
            'â€¢ `!Ù…Ù†Ø¹ on/off`\n' +
            'â€¢ `!Ù…Ù†Ø¹ add <ÙƒÙ„Ù…Ø©>`\n' +
            'â€¢ `!Ù…Ù†Ø¹ remove <ÙƒÙ„Ù…Ø©>`\n' +
            'â€¢ `!Ù…Ù†Ø¹ list`'
    }, { quoted: message });
}

async function checkAntiBadword(sock, message) {
    const chatId = message.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return false;
    
    const settings = await getAntibadwordSettings(chatId);
    if (!settings.enabled || !settings.words || settings.words.length === 0) return false;
    
    const messageText = (message.message?.conversation ||
        message.message?.extendedTextMessage?.text ||
        message.message?.imageMessage?.caption ||
        message.message?.videoMessage?.caption ||
        '').toLowerCase();
    
    if (!messageText) return false;
    
    for (const word of settings.words) {
        if (messageText.includes(word.toLowerCase())) {
            try {
                await sock.sendMessage(chatId, { delete: message.key });
                await sock.sendMessage(chatId, {
                    text: `âŒ ØªÙ… Ø­Ø°Ù Ø§Ù„Ø±Ø³Ø§Ù„Ø©: ØªØ­ØªÙˆÙŠ Ø¹Ù„Ù‰ ÙƒÙ„Ù…Ø© Ù…Ù…Ù†ÙˆØ¹Ø© "${word}"`
                });
                return true;
            } catch (error) {
                console.error('Ø®Ø·Ø£ ÙÙŠ Ø­Ø°Ù Ø§Ù„Ø±Ø³Ø§Ù„Ø©:', error);
            }
            break;
        }
    }
    return false;
}

export default {
    command: 'Ù…Ù†Ø¹',
    aliases: ['antibadword', 'abw', 'badword', 'antibad', 'ÙƒÙ„Ù…Ø§Øª_Ù…Ù…Ù†ÙˆØ¹Ø©'],
    category: 'Ø§Ù„Ù…Ø´Ø±ÙÙˆÙ†',
    description: 'Ø¥Ø¹Ø¯Ø§Ø¯ ÙÙ„ØªØ± Ù…Ù†Ø¹ Ø§Ù„ÙƒÙ„Ù…Ø§Øª Ø§Ù„Ø¨Ø°ÙŠØ¦Ø© Ù„Ø­Ø°Ù Ø§Ù„Ø±Ø³Ø§Ø¦Ù„ Ø§Ù„ØªÙŠ ØªØ­ØªÙˆÙŠ Ø¹Ù„Ù‰ ÙƒÙ„Ù…Ø§Øª ØºÙŠØ± Ù„Ø§Ø¦Ù‚Ø©',
    usage: '!Ù…Ù†Ø¹ <ÙˆÙ†|ÙˆÙÙ|Ø¥Ø¶Ø§ÙØ©|Ø­Ø°Ù|Ø¹Ø±Ø¶>',
    groupOnly: true,
    adminOnly: true,
    
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const match = args.join(' ');
        try {
            await handleAntiBadwordCommand(sock, chatId, message, match);
        } catch (error) {
            console.error('Ø®Ø·Ø£ ÙÙŠ Ø£Ù…Ø± Ù…Ù†Ø¹ Ø§Ù„ÙƒÙ„Ù…Ø§Øª:', error);
            await sock.sendMessage(chatId, {
                text: 'âŒ *Ø®Ø·Ø£ ÙÙŠ Ù…Ø¹Ø§Ù„Ø¬Ø© Ø§Ù„Ø£Ù…Ø±*\n\nÙŠØ±Ø¬Ù‰ Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø© Ù…Ø±Ø© Ø£Ø®Ø±Ù‰ Ù„Ø§Ø­Ù‚Ø§Ù‹.'
            }, { quoted: message });
        }
    }
};

export { handleAntiBadwordCommand };
export { checkAntiBadword };

