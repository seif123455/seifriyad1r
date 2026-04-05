import fs from 'fs';
import path from 'path';
import { dataFile } from '../lib/paths.js';
import store from '../lib/lightweight_store.js';

const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);
const configPath = dataFile('autoread.json');

async function initConfig() {
    if (HAS_DB) {
        const config = await store.getSetting('global', 'autoread');
        return config || { enabled: false };
    } else {
        if (!fs.existsSync(configPath)) {
            const dataDir = path.dirname(configPath);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }
            fs.writeFileSync(configPath, JSON.stringify({ enabled: false }, null, 2));
        }
        return JSON.parse(fs.readFileSync(configPath, "utf-8"));
    }
}

async function saveConfig(config) {
    if (HAS_DB) {
        await store.saveSetting('global', 'autoread', config);
    } else {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    }
}

async function isAutoreadEnabled() {
    try {
        const config = await initConfig();
        return config.enabled;
    } catch (error) {
        console.error('Ø®Ø·Ø£ ÙÙŠ Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø­Ø§Ù„Ø© Ø§Ù„Ù‚Ø±Ø§Ø¡Ø© Ø§Ù„ØªÙ„Ù‚Ø§Ø¦ÙŠØ©:', error);
        return false;
    }
}

function isBotMentionedInMessage(message, botNumber) {
    if (!message.message) return false;
    
    const messageTypes = [
        'extendedTextMessage', 'imageMessage', 'videoMessage', 'stickerMessage',
        'documentMessage', 'audioMessage', 'contactMessage', 'locationMessage'
    ];
    
    for (const type of messageTypes) {
        if (message.message[type]?.contextInfo?.mentionedJid) {
            const mentionedJid = message.message[type].contextInfo.mentionedJid;
            if (mentionedJid.some((jid) => jid === botNumber)) {
                return true;
            }
        }
    }
    
    const textContent = message.message.conversation ||
        message.message.extendedTextMessage?.text ||
        message.message.imageMessage?.caption ||
        message.message.videoMessage?.caption || '';
    
    if (textContent) {
        const botUsername = botNumber.split('@')[0];
        if (textContent.includes(`@${botUsername}`)) {
            return true;
        }
        
        const botNames = [global.botname?.toLowerCase(), 'bot', 'mega', 'crazy'];
        const words = textContent.toLowerCase().split(/\s+/);
        if (botNames.some(name => words.includes(name))) {
            return true;
        }
    }
    return false;
}

export async function handleAutoread(sock, message) {
    try {
        const ghostMode = await store.getSetting('global', 'stealthMode');
        if (ghostMode && ghostMode.enabled) {
            console.log('ðŸ‘» Ø§Ù„ÙˆØ¶Ø¹ Ø§Ù„Ø®ÙÙŠ Ù†Ø´Ø· - ØªØ®Ø·ÙŠ Ø¥Ø´Ø¹Ø§Ø± Ø§Ù„Ù‚Ø±Ø§Ø¡Ø©');
            return false;
        }
    } catch (err) { }
    
    const enabled = await isAutoreadEnabled();
    if (enabled) {
        const botNumber = `${sock.user.id.split(':')[0]}@s.whatsapp.net`;
        const isBotMentioned = isBotMentionedInMessage(message, botNumber);
        
        if (isBotMentioned) {
            return false;
        } else {
            try {
                const key = {
                    remoteJid: message.key.remoteJid,
                    id: message.key.id,
                    participant: message.key.participant
                };
                await sock.readMessages([key]);
                return true;
            } catch (error) {
                console.error('Ø®Ø·Ø£ ÙÙŠ ØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ø±Ø³Ø§Ù„Ø© ÙƒÙ…Ù‚Ø±ÙˆØ¡Ø©:', error);
                return false;
            }
        }
    }
    return false;
}

export default {
    command: 'Ù‚Ø±Ø§Ø¡Ø©',
    aliases: ['autoread', 'read', 'autoreadmsg', 'ØªÙ„Ù‚Ø§Ø¦ÙŠ_Ù‚Ø±Ø§Ø¡Ø©'],
    category: 'Ø§Ù„Ù…Ø§Ù„Ùƒ',
    description: 'ØªÙØ¹ÙŠÙ„ Ø£Ùˆ ØªØ¹Ø·ÙŠÙ„ Ø§Ù„Ù‚Ø±Ø§Ø¡Ø© Ø§Ù„ØªÙ„Ù‚Ø§Ø¦ÙŠØ© Ù„Ù„Ø±Ø³Ø§Ø¦Ù„',
    usage: '!Ù‚Ø±Ø§Ø¡Ø© <ÙˆÙ†|ÙˆÙÙ>',
    ownerOnly: true,
    
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const channelInfo = context.channelInfo || {};
        
        try {
            const config = await initConfig();
            const action = args[0]?.toLowerCase();
            
            if (!action) {
                const ghostMode = await store.getSetting('global', 'stealthMode');
                const ghostActive = ghostMode && ghostMode.enabled;
                
                await sock.sendMessage(chatId, {
                    text: `*ðŸ“– Ø­Ø§Ù„Ø© Ø§Ù„Ù‚Ø±Ø§Ø¡Ø© Ø§Ù„ØªÙ„Ù‚Ø§Ø¦ÙŠØ©*\n\n` +
                        `*Ø§Ù„Ø­Ø§Ù„Ø©:* ${config.enabled ? 'âœ… Ù…ÙØ¹Ù„' : 'âŒ Ù…Ø¹Ø·Ù„'}\n` +
                        `*Ø§Ù„ÙˆØ¶Ø¹ Ø§Ù„Ø®ÙÙŠ:* ${ghostActive ? 'ðŸ‘» Ù†Ø´Ø· (ÙŠØªØ¬Ø§ÙˆØ² Ø§Ù„Ù‚Ø±Ø§Ø¡Ø© Ø§Ù„ØªÙ„Ù‚Ø§Ø¦ÙŠØ©)' : 'âŒ ØºÙŠØ± Ù†Ø´Ø·'}\n` +
                        `*Ø§Ù„ØªØ®Ø²ÙŠÙ†:* ${HAS_DB ? 'Ù‚Ø§Ø¹Ø¯Ø© Ø¨ÙŠØ§Ù†Ø§Øª' : 'Ù…Ù„ÙØ§Øª'}\n\n` +
                        `*Ø§Ù„Ø£ÙˆØ§Ù…Ø±:*\n` +
                        `â€¢ \`!Ù‚Ø±Ø§Ø¡Ø© on\` - ØªÙØ¹ÙŠÙ„ Ø§Ù„Ù‚Ø±Ø§Ø¡Ø© Ø§Ù„ØªÙ„Ù‚Ø§Ø¦ÙŠØ©\n` +
                        `â€¢ \`!Ù‚Ø±Ø§Ø¡Ø© off\` - ØªØ¹Ø·ÙŠÙ„ Ø§Ù„Ù‚Ø±Ø§Ø¡Ø© Ø§Ù„ØªÙ„Ù‚Ø§Ø¦ÙŠØ©\n\n` +
                        `*Ù…Ø§Ø°Ø§ ÙŠÙØ¹Ù„:*\n` +
                        `Ø¹Ù†Ø¯ Ø§Ù„ØªÙØ¹ÙŠÙ„ØŒ ÙŠÙ‚ÙˆÙ… Ø§Ù„Ø¨ÙˆØª Ø¨ÙˆØ¶Ø¹ Ø¹Ù„Ø§Ù…Ø© Ù…Ù‚Ø±ÙˆØ¡Ø© Ø¹Ù„Ù‰ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø±Ø³Ø§Ø¦Ù„ ØªÙ„Ù‚Ø§Ø¦ÙŠØ§Ù‹.\n\n` +
                        `*Ù…Ù„Ø§Ø­Ø¸Ø©:* Ø§Ù„ÙˆØ¶Ø¹ Ø§Ù„Ø®ÙÙŠ Ù„Ù‡ Ø£ÙˆÙ„ÙˆÙŠØ© Ø¹Ù„Ù‰ Ø§Ù„Ù‚Ø±Ø§Ø¡Ø© Ø§Ù„ØªÙ„Ù‚Ø§Ø¦ÙŠØ©.`,
                    ...channelInfo
                }, { quoted: message });
                return;
            }
            
            if (action === 'on' || action === 'enable') {
                if (config.enabled) {
                    await sock.sendMessage(chatId, {
                        text: 'âš ï¸ *Ø§Ù„Ù‚Ø±Ø§Ø¡Ø© Ø§Ù„ØªÙ„Ù‚Ø§Ø¦ÙŠØ© Ù…ÙØ¹Ù„Ø© Ø¨Ø§Ù„ÙØ¹Ù„*',
                        ...channelInfo
                    }, { quoted: message });
                    return;
                }
                
                config.enabled = true;
                await saveConfig(config);
                
                const ghostMode = await store.getSetting('global', 'stealthMode');
                const ghostActive = ghostMode && ghostMode.enabled;
                
                await sock.sendMessage(chatId, {
                    text: `âœ… *ØªÙ… ØªÙØ¹ÙŠÙ„ Ø§Ù„Ù‚Ø±Ø§Ø¡Ø© Ø§Ù„ØªÙ„Ù‚Ø§Ø¦ÙŠØ©!*\n\nØ³ÙŠØªÙ… ÙˆØ¶Ø¹ Ø¹Ù„Ø§Ù…Ø© Ù…Ù‚Ø±ÙˆØ¡Ø© Ø¹Ù„Ù‰ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø±Ø³Ø§Ø¦Ù„ ØªÙ„Ù‚Ø§Ø¦ÙŠØ§Ù‹.${ghostActive ? '\n\nâš ï¸ *Ù…Ù„Ø§Ø­Ø¸Ø©:* Ø§Ù„ÙˆØ¶Ø¹ Ø§Ù„Ø®ÙÙŠ Ù†Ø´Ø· Ø­Ø§Ù„ÙŠØ§Ù‹ ÙˆØ³ÙŠØªØ¬Ø§ÙˆØ² Ù‡Ø°Ù‡ Ø§Ù„Ø®Ø§ØµÙŠØ©.' : ''}`,
                    ...channelInfo
                }, { quoted: message });
                
            } else if (action === 'off' || action === 'disable') {
                if (!config.enabled) {
                    await sock.sendMessage(chatId, {
                        text: 'âš ï¸ *Ø§Ù„Ù‚Ø±Ø§Ø¡Ø© Ø§Ù„ØªÙ„Ù‚Ø§Ø¦ÙŠØ© Ù…Ø¹Ø·Ù„Ø© Ø¨Ø§Ù„ÙØ¹Ù„*',
                        ...channelInfo
                    }, { quoted: message });
                    return;
                }
                
                config.enabled = false;
                await saveConfig(config);
                
                await sock.sendMessage(chatId, {
                    text: 'âŒ *ØªÙ… ØªØ¹Ø·ÙŠÙ„ Ø§Ù„Ù‚Ø±Ø§Ø¡Ø© Ø§Ù„ØªÙ„Ù‚Ø§Ø¦ÙŠØ©!*\n\nÙ„Ù† ÙŠØªÙ… ÙˆØ¶Ø¹ Ø¹Ù„Ø§Ù…Ø© Ù…Ù‚Ø±ÙˆØ¡Ø© Ø¹Ù„Ù‰ Ø§Ù„Ø±Ø³Ø§Ø¦Ù„ ØªÙ„Ù‚Ø§Ø¦ÙŠØ§Ù‹.',
                    ...channelInfo
                }, { quoted: message });
                
            } else {
                await sock.sendMessage(chatId, {
                    text: 'âŒ *Ø®ÙŠØ§Ø± ØºÙŠØ± ØµØ­ÙŠØ­!*\n\nØ§Ø³ØªØ®Ø¯Ù…: `!Ù‚Ø±Ø§Ø¡Ø© on/off`',
                    ...channelInfo
                }, { quoted: message });
            }
            
        } catch (error) {
            console.error('Ø®Ø·Ø£ ÙÙŠ Ø£Ù…Ø± Ø§Ù„Ù‚Ø±Ø§Ø¡Ø© Ø§Ù„ØªÙ„Ù‚Ø§Ø¦ÙŠØ©:', error);
            await sock.sendMessage(chatId, {
                text: 'âŒ *Ø®Ø·Ø£ ÙÙŠ Ù…Ø¹Ø§Ù„Ø¬Ø© Ø§Ù„Ø£Ù…Ø±!*',
                ...channelInfo
            }, { quoted: message });
        }
    },
    isAutoreadEnabled,
    isBotMentionedInMessage,
    handleAutoread
};

