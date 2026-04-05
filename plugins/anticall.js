import store from '../lib/lightweight_store.js';
import fs from 'fs';

const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);
const ANTICALL_PATH = './data/anticall.json';

async function readState() {
    try {
        if (HAS_DB) {
            const settings = await store.getSetting('global', 'anticall');
            return settings || { enabled: false };
        } else {
            if (!fs.existsSync(ANTICALL_PATH)) return { enabled: false };
            const raw = fs.readFileSync(ANTICALL_PATH, 'utf8');
            const data = JSON.parse(raw || '{}');
            return { enabled: !!data.enabled };
        }
    } catch {
        return { enabled: false };
    }
}

async function writeState(enabled) {
    try {
        if (HAS_DB) {
            await store.saveSetting('global', 'anticall', { enabled: !!enabled });
        } else {
            if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true });
            fs.writeFileSync(ANTICALL_PATH, JSON.stringify({ enabled: !!enabled }, null, 2));
        }
    } catch (e) {
        console.error('Ø®Ø·Ø£ ÙÙŠ Ø­ÙØ¸ Ø­Ø§Ù„Ø© Ù…Ù†Ø¹ Ø§Ù„Ù…ÙƒØ§Ù„Ù…Ø§Øª:', e);
    }
}

export default {
    command: 'Ù…ÙƒØ§Ù„Ù…Ø§Øª',
    aliases: ['anticall', 'acall', 'callblock', 'Ù…Ù†Ø¹_Ø§Ù„Ù…ÙƒØ§Ù„Ù…Ø§Øª'],
    category: 'Ø§Ù„Ù…Ø§Ù„Ùƒ',
    description: 'ØªÙØ¹ÙŠÙ„ Ø£Ùˆ ØªØ¹Ø·ÙŠÙ„ Ø§Ù„Ø­Ø¸Ø± Ø§Ù„ØªÙ„Ù‚Ø§Ø¦ÙŠ Ù„Ù„Ù…ÙƒØ§Ù„Ù…Ø§Øª Ø§Ù„ÙˆØ§Ø±Ø¯Ø©',
    usage: '!Ù…ÙƒØ§Ù„Ù…Ø§Øª <ÙˆÙ†|ÙˆÙÙ|Ø­Ø§Ù„Ø©>',
    ownerOnly: true,
    
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const state = await readState();
        const sub = args.join(' ').trim().toLowerCase();
        
        if (!sub || !['on', 'off', 'status'].includes(sub)) {
            return await sock.sendMessage(chatId, {
                text: '*ðŸ“µ Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ù…Ù†Ø¹ Ø§Ù„Ù…ÙƒØ§Ù„Ù…Ø§Øª*\n\n' +
                    'ðŸ”‡ Ø­Ø¸Ø± ØªÙ„Ù‚Ø§Ø¦ÙŠ Ù„Ù„Ù…ÙƒØ§Ù„Ù…Ø§Øª Ø§Ù„ÙˆØ§Ø±Ø¯Ø©\n\n' +
                    '*Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…:*\n' +
                    'â€¢ `!Ù…ÙƒØ§Ù„Ù…Ø§Øª on` - ØªÙØ¹ÙŠÙ„\n' +
                    'â€¢ `!Ù…ÙƒØ§Ù„Ù…Ø§Øª off` - ØªØ¹Ø·ÙŠÙ„\n' +
                    'â€¢ `!Ù…ÙƒØ§Ù„Ù…Ø§Øª status` - Ø§Ù„Ø­Ø§Ù„Ø© Ø§Ù„Ø­Ø§Ù„ÙŠØ©\n\n' +
                    `*Ø§Ù„Ø­Ø§Ù„Ø© Ø§Ù„Ø­Ø§Ù„ÙŠØ©:* ${state.enabled ? 'âœ… Ù…ÙØ¹Ù„' : 'âŒ Ù…Ø¹Ø·Ù„'}\n` +
                    `*Ø§Ù„ØªØ®Ø²ÙŠÙ†:* ${HAS_DB ? 'Ù‚Ø§Ø¹Ø¯Ø© Ø¨ÙŠØ§Ù†Ø§Øª' : 'Ù…Ù„ÙØ§Øª'}`
            }, { quoted: message });
        }
        
        if (sub === 'status') {
            return await sock.sendMessage(chatId, {
                text: `ðŸ“µ *Ø­Ø§Ù„Ø© Ù…Ù†Ø¹ Ø§Ù„Ù…ÙƒØ§Ù„Ù…Ø§Øª*\n\n` +
                    `Ø§Ù„Ø­Ø§Ù„ÙŠØ©: ${state.enabled ? 'âœ… *Ù…ÙØ¹Ù„*' : 'âŒ *Ù…Ø¹Ø·Ù„*'}\n` +
                    `Ø§Ù„ØªØ®Ø²ÙŠÙ†: ${HAS_DB ? 'Ù‚Ø§Ø¹Ø¯Ø© Ø¨ÙŠØ§Ù†Ø§Øª' : 'Ù…Ù„ÙØ§Øª'}\n\n` +
                    `${state.enabled ? 'Ø³ÙŠØªÙ… Ø±ÙØ¶ ÙˆØ­Ø¸Ø± Ø¬Ù…ÙŠØ¹ Ø§Ù„Ù…ÙƒØ§Ù„Ù…Ø§Øª Ø§Ù„ÙˆØ§Ø±Ø¯Ø©.' : 'Ø§Ù„Ù…ÙƒØ§Ù„Ù…Ø§Øª Ø§Ù„ÙˆØ§Ø±Ø¯Ø© Ù…Ø³Ù…ÙˆØ­ Ø¨Ù‡Ø§.'}`
            }, { quoted: message });
        }
        
        const enable = sub === 'on';
        await writeState(enable);
        
        await sock.sendMessage(chatId, {
            text: `ðŸ“µ *ØªÙ… ${enable ? 'ØªÙØ¹ÙŠÙ„' : 'ØªØ¹Ø·ÙŠÙ„'} Ù…Ù†Ø¹ Ø§Ù„Ù…ÙƒØ§Ù„Ù…Ø§Øª*\n\n` +
                `${enable ? 'âœ… Ø³ÙŠØªÙ… Ø±ÙØ¶ ÙˆØ­Ø¸Ø± Ø§Ù„Ù…ÙƒØ§Ù„Ù…Ø§Øª Ø§Ù„ÙˆØ§Ø±Ø¯Ø© ØªÙ„Ù‚Ø§Ø¦ÙŠØ§Ù‹.' : 'âŒ Ø£ØµØ¨Ø­Øª Ø§Ù„Ù…ÙƒØ§Ù„Ù…Ø§Øª Ø§Ù„ÙˆØ§Ø±Ø¯Ø© Ù…Ø³Ù…ÙˆØ­Ø© Ø§Ù„Ø¢Ù†.'}`
        }, { quoted: message });
    },
    readState,
    writeState
};

