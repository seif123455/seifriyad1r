import store from '../lib/lightweight_store.js';

const autoEmojis = [
    'ðŸ’˜', 'ðŸ’', 'ðŸ’–', 'ðŸ’—', 'ðŸ’“', 'ðŸ’ž', 'ðŸ’•', 'ðŸ’Ÿ', 'â£ï¸', 'â¤ï¸',
    'ðŸ§¡', 'ðŸ’›', 'ðŸ’š', 'ðŸ’™', 'ðŸ’œ', 'ðŸ¤Ž', 'ðŸ–¤', 'ðŸ¤', 'â™¥ï¸',
    'ðŸŽˆ', 'ðŸŽ', 'ðŸ’Œ', 'ðŸ’', 'ðŸ˜˜', 'ðŸ¤—',
    'ðŸŒ¸', 'ðŸŒ¹', 'ðŸ¥€', 'ðŸŒº', 'ðŸŒ¼', 'ðŸŒ·',
    'ðŸ', 'â­ï¸', 'ðŸŒŸ', 'ðŸ˜Š', 'ðŸ¥°', 'ðŸ˜',
    'ðŸ¤©', 'â˜ºï¸', 'ðŸ”¥', 'ðŸ‘', 'ðŸ˜‚'
];

let AUTO_REACT_MESSAGES = false;

// ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ø­Ø§Ù„Ø© Ø§Ù„Ù…Ø­ÙÙˆØ¸Ø©
store.getSetting('global', 'autoReaction').then((v) => {
    if (v?.enabled !== undefined) AUTO_REACT_MESSAGES = v.enabled;
}).catch(() => { });

let lastReactedTime = 0;

function random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export default {
    command: 'ØªÙØ§Ø¹Ù„',
    aliases: ['autoreact', 'areact', 'Ø±Ø¯_ØªÙ„Ù‚Ø§Ø¦ÙŠ', 'ØªÙØ§Ø¹Ù„_ØªÙ„Ù‚Ø§Ø¦ÙŠ'],
    category: 'Ø§Ù„Ù…Ø§Ù„Ùƒ',
    description: 'ØªÙØ¹ÙŠÙ„ Ø£Ùˆ ØªØ¹Ø·ÙŠÙ„ Ø§Ù„Ø±Ø¯ÙˆØ¯ Ø§Ù„ØªÙ„Ù‚Ø§Ø¦ÙŠØ© Ø¨Ø§Ù„Ø§ÙŠÙ…ÙˆØ¬ÙŠ Ø¹Ù„Ù‰ Ø§Ù„Ø±Ø³Ø§Ø¦Ù„',
    usage: '!ØªÙØ§Ø¹Ù„ ÙˆÙ†/ÙˆÙÙ',
    ownerOnly: true,
    
    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        
        if (!args[0] || !['on', 'off'].includes(args[0])) {
            await sock.sendMessage(chatId, {
                text: '*ðŸ“Œ Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…:*\n`!ØªÙØ§Ø¹Ù„ on/off`\n\n' +
                    'â€¢ `!ØªÙØ§Ø¹Ù„ on` - ØªÙØ¹ÙŠÙ„ Ø§Ù„Ø±Ø¯ÙˆØ¯ Ø§Ù„ØªÙ„Ù‚Ø§Ø¦ÙŠØ©\n' +
                    'â€¢ `!ØªÙØ§Ø¹Ù„ off` - ØªØ¹Ø·ÙŠÙ„ Ø§Ù„Ø±Ø¯ÙˆØ¯ Ø§Ù„ØªÙ„Ù‚Ø§Ø¦ÙŠØ©',
                ...channelInfo
            }, { quoted: message });
            return;
        }
        
        AUTO_REACT_MESSAGES = args[0] === 'on';
        await store.saveSetting('global', 'autoReaction', { enabled: AUTO_REACT_MESSAGES });
        
        await sock.sendMessage(chatId, {
            text: AUTO_REACT_MESSAGES 
                ? 'âœ… *ØªÙ… ØªÙØ¹ÙŠÙ„ Ø§Ù„Ø±Ø¯ÙˆØ¯ Ø§Ù„ØªÙ„Ù‚Ø§Ø¦ÙŠØ©!*\n\nØ³ÙŠØªÙ… Ø§Ù„Ø±Ø¯ Ø¹Ù„Ù‰ Ø§Ù„Ø±Ø³Ø§Ø¦Ù„ Ø¨Ø§ÙŠÙ…ÙˆØ¬ÙŠ Ø¹Ø´ÙˆØ§Ø¦ÙŠ ðŸ’–'
                : 'âŒ *ØªÙ… ØªØ¹Ø·ÙŠÙ„ Ø§Ù„Ø±Ø¯ÙˆØ¯ Ø§Ù„ØªÙ„Ù‚Ø§Ø¦ÙŠØ©!*\n\nÙ„Ù† ÙŠØªÙ… Ø§Ù„Ø±Ø¯ Ø¹Ù„Ù‰ Ø§Ù„Ø±Ø³Ø§Ø¦Ù„ ØªÙ„Ù‚Ø§Ø¦ÙŠØ§Ù‹.',
            ...channelInfo
        }, { quoted: message });
        
        if (sock.__autoReactAttached) return;
        
        sock.ev.on('messages.upsert', async ({ messages }) => {
            if (!AUTO_REACT_MESSAGES) return;
            
            for (const m of messages) {
                if (!m?.message) continue;
                if (m.key.fromMe) continue;
                
                const text = m.message.conversation ||
                    m.message.extendedTextMessage?.text ||
                    '';
                
                if (!text) continue;
                if (/^[!#.$%^&*+=?<>]/.test(text)) continue;
                
                const now = Date.now();
                if (now - lastReactedTime < 2000) continue;
                
                await sock.sendMessage(m.key.remoteJid, {
                    react: {
                        text: random(autoEmojis),
                        key: m.key
                    }
                });
                lastReactedTime = now;
            }
        });
        
        sock.__autoReactAttached = true;
    }
};

