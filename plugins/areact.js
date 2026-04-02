import store from '../lib/lightweight_store.js';

const autoEmojis = [
    '💘', '💝', '💖', '💗', '💓', '💞', '💕', '💟', '❣️', '❤️',
    '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '♥️',
    '🎈', '🎁', '💌', '💐', '😘', '🤗',
    '🌸', '🌹', '🥀', '🌺', '🌼', '🌷',
    '🍁', '⭐️', '🌟', '😊', '🥰', '😍',
    '🤩', '☺️', '🔥', '👍', '😂'
];

let AUTO_REACT_MESSAGES = false;

// تحميل الحالة المحفوظة
store.getSetting('global', 'autoReaction').then((v) => {
    if (v?.enabled !== undefined) AUTO_REACT_MESSAGES = v.enabled;
}).catch(() => { });

let lastReactedTime = 0;

function random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export default {
    command: 'تفاعل',
    aliases: ['autoreact', 'areact', 'رد_تلقائي', 'تفاعل_تلقائي'],
    category: 'owner',
    description: 'تفعيل أو تعطيل الردود التلقائية بالايموجي على الرسائل',
    usage: '!تفاعل on/off',
    ownerOnly: true,
    
    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        
        if (!args[0] || !['on', 'off'].includes(args[0])) {
            await sock.sendMessage(chatId, {
                text: '*📌 الاستخدام:*\n`!تفاعل on/off`\n\n' +
                    '• `!تفاعل on` - تفعيل الردود التلقائية\n' +
                    '• `!تفاعل off` - تعطيل الردود التلقائية',
                ...channelInfo
            }, { quoted: message });
            return;
        }
        
        AUTO_REACT_MESSAGES = args[0] === 'on';
        await store.saveSetting('global', 'autoReaction', { enabled: AUTO_REACT_MESSAGES });
        
        await sock.sendMessage(chatId, {
            text: AUTO_REACT_MESSAGES 
                ? '✅ *تم تفعيل الردود التلقائية!*\n\nسيتم الرد على الرسائل بايموجي عشوائي 💖'
                : '❌ *تم تعطيل الردود التلقائية!*\n\nلن يتم الرد على الرسائل تلقائياً.',
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