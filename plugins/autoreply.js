import fs from 'fs';
import path from 'path';
import { dataFile } from '../lib/paths.js';
import store from '../lib/lightweight_store.js';

const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);
const configPath = dataFile('autoreplies.json');

async function initConfig() {
    if (HAS_DB) {
        const config = await store.getSetting('global', 'autoreplies');
        return config || { enabled: true, replies: [] };
    } else {
        if (!fs.existsSync(configPath)) {
            const dataDir = path.dirname(configPath);
            if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
            fs.writeFileSync(configPath, JSON.stringify({ enabled: true, replies: [] }, null, 2));
        }
        return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }
}

async function saveConfig(config) {
    if (HAS_DB) {
        await store.saveSetting('global', 'autoreplies', config);
    } else {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    }
}

// Ø§Ù„ØªØµØ¯ÙŠØ± Ø§Ù„Ù…Ø³Ù…Ù‰ - Ù…Ø³ØªÙˆØ±Ø¯ Ù…Ù† lib/messageHandler.ts
export async function handleAutoReply(sock, chatId, message, userMessage) {
    try {
        const config = await initConfig();
        if (!config.enabled || !config.replies.length) return false;
        
        const lowerMsg = userMessage.toLowerCase().trim();
        
        for (const reply of config.replies) {
            const trigger = reply.trigger.toLowerCase();
            const matched = reply.exactMatch
                ? lowerMsg === trigger
                : lowerMsg.includes(trigger);
            
            if (matched) {
                const senderName = message.pushName || 'Ù‡Ù†Ø§Ùƒ';
                const responseText = reply.response.replace(/\{name\}/gi, senderName);
                
                await sock.sendMessage(chatId, {
                    text: responseText,
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '01144534147@newsletter',
                            newsletterName: 'Crazy Seif',
                            serverMessageId: -1
                        }
                    }
                }, { quoted: message });
                return true;
            }
        }
    } catch (e) {
        console.error('[AUTOREPLY] Ø®Ø·Ø£:', e.message);
    }
    return false;
}

export { initConfig, saveConfig };

export default {
    command: 'Ø±Ø¯ÙˆØ¯',
    aliases: ['autoreply', 'ar', 'autorespond', 'Ø±Ø¯_ØªÙ„Ù‚Ø§Ø¦ÙŠ'],
    category: 'Ø§Ù„Ù…Ø§Ù„Ùƒ',
    description: 'ØªÙØ¹ÙŠÙ„ Ø£Ùˆ ØªØ¹Ø·ÙŠÙ„ Ù†Ø¸Ø§Ù… Ø§Ù„Ø±Ø¯ÙˆØ¯ Ø§Ù„ØªÙ„Ù‚Ø§Ø¦ÙŠØ©',
    usage: '!Ø±Ø¯ÙˆØ¯ <ÙˆÙ†|ÙˆÙÙ>',
    ownerOnly: true,
    
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};
        
        try {
            const config = await initConfig();
            const action = args[0]?.toLowerCase();
            
            if (!action) {
                return await sock.sendMessage(chatId, {
                    text: `*ðŸ¤– Ø­Ø§Ù„Ø© Ø§Ù„Ø±Ø¯ÙˆØ¯ Ø§Ù„ØªÙ„Ù‚Ø§Ø¦ÙŠØ©*\n\n` +
                        `*Ø§Ù„Ø­Ø§Ù„Ø©:* ${config.enabled ? 'âœ… Ù…ÙØ¹Ù„' : 'âŒ Ù…Ø¹Ø·Ù„'}\n` +
                        `*Ø¹Ø¯Ø¯ Ø§Ù„Ø±Ø¯ÙˆØ¯:* ${config.replies.length}\n` +
                        `*Ø§Ù„ØªØ®Ø²ÙŠÙ†:* ${HAS_DB ? 'Ù‚Ø§Ø¹Ø¯Ø© Ø¨ÙŠØ§Ù†Ø§Øª' : 'Ù…Ù„ÙØ§Øª'}\n\n` +
                        `*Ø§Ù„Ø£ÙˆØ§Ù…Ø±:*\n` +
                        `â€¢ \`!Ø±Ø¯ÙˆØ¯ on\` - ØªÙØ¹ÙŠÙ„\n` +
                        `â€¢ \`!Ø±Ø¯ÙˆØ¯ off\` - ØªØ¹Ø·ÙŠÙ„\n` +
                        `â€¢ \`!Ø§Ø¶Ù_Ø±Ø¯\` - Ø¥Ø¶Ø§ÙØ© Ù…Ø´ØºÙ„ Ø¬Ø¯ÙŠØ¯\n` +
                        `â€¢ \`!Ø­Ø°Ù_Ø±Ø¯\` - Ø­Ø°Ù Ù…Ø´ØºÙ„\n` +
                        `â€¢ \`!Ù‚Ø§Ø¦Ù…Ø©_Ø§Ù„Ø±Ø¯ÙˆØ¯\` - Ø¹Ø±Ø¶ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ù…Ø´ØºÙ„Ø§Øª`,
                    ...channelInfo
                }, { quoted: message });
            }
            
            if (action === 'on' || action === 'enable') {
                if (config.enabled) {
                    return await sock.sendMessage(chatId, {
                        text: 'âš ï¸ *Ø§Ù„Ø±Ø¯ÙˆØ¯ Ø§Ù„ØªÙ„Ù‚Ø§Ø¦ÙŠØ© Ù…ÙØ¹Ù„Ø© Ø¨Ø§Ù„ÙØ¹Ù„*',
                        ...channelInfo
                    }, { quoted: message });
                }
                
                config.enabled = true;
                await saveConfig(config);
                
                return await sock.sendMessage(chatId, {
                    text: 'âœ… *ØªÙ… ØªÙØ¹ÙŠÙ„ Ø§Ù„Ø±Ø¯ÙˆØ¯ Ø§Ù„ØªÙ„Ù‚Ø§Ø¦ÙŠØ©!*\n\nØ³ÙŠÙ‚ÙˆÙ… Ø§Ù„Ø¨ÙˆØª Ø§Ù„Ø¢Ù† Ø¨Ø§Ù„Ø±Ø¯ Ø¹Ù„Ù‰ Ø§Ù„Ù…Ø´ØºÙ„Ø§Øª Ø§Ù„Ù…Ø­Ø¯Ø¯Ø©.',
                    ...channelInfo
                }, { quoted: message });
            }
            
            if (action === 'off' || action === 'disable') {
                if (!config.enabled) {
                    return await sock.sendMessage(chatId, {
                        text: 'âš ï¸ *Ø§Ù„Ø±Ø¯ÙˆØ¯ Ø§Ù„ØªÙ„Ù‚Ø§Ø¦ÙŠØ© Ù…Ø¹Ø·Ù„Ø© Ø¨Ø§Ù„ÙØ¹Ù„*',
                        ...channelInfo
                    }, { quoted: message });
                }
                
                config.enabled = false;
                await saveConfig(config);
                
                return await sock.sendMessage(chatId, {
                    text: 'âŒ *ØªÙ… ØªØ¹Ø·ÙŠÙ„ Ø§Ù„Ø±Ø¯ÙˆØ¯ Ø§Ù„ØªÙ„Ù‚Ø§Ø¦ÙŠØ©!*\n\nÙ„Ù† ÙŠÙ‚ÙˆÙ… Ø§Ù„Ø¨ÙˆØª Ø¨Ø§Ù„Ø±Ø¯ Ø¹Ù„Ù‰ Ø§Ù„Ù…Ø´ØºÙ„Ø§Øª.',
                    ...channelInfo
                }, { quoted: message });
            }
            
            return await sock.sendMessage(chatId, {
                text: 'âŒ *Ø®ÙŠØ§Ø± ØºÙŠØ± ØµØ­ÙŠØ­!*\n\nØ§Ø³ØªØ®Ø¯Ù…: `!Ø±Ø¯ÙˆØ¯ on` Ø£Ùˆ `!Ø±Ø¯ÙˆØ¯ off`',
                ...channelInfo
            }, { quoted: message });
            
        } catch (e) {
            console.error('Ø®Ø·Ø£ ÙÙŠ Ø£Ù…Ø± Ø§Ù„Ø±Ø¯ÙˆØ¯ Ø§Ù„ØªÙ„Ù‚Ø§Ø¦ÙŠØ©:', e);
            await sock.sendMessage(chatId, {
                text: 'âŒ *Ø®Ø·Ø£ ÙÙŠ Ù…Ø¹Ø§Ù„Ø¬Ø© Ø§Ù„Ø£Ù…Ø±!*',
                ...channelInfo
            }, { quoted: message });
        }
    },
    handleAutoReply,
    initConfig,
    saveConfig
};

