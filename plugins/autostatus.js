import fs from 'fs';
import path from 'path';
import { dataFile } from '../lib/paths.js';
import store from '../lib/lightweight_store.js';

const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);
const configPath = dataFile('autoStatus.json');

if (!HAS_DB && !fs.existsSync(configPath)) {
    if (!fs.existsSync(path.dirname(configPath))) {
        fs.mkdirSync(path.dirname(configPath), { recursive: true });
    }
    fs.writeFileSync(configPath, JSON.stringify({
        enabled: false,
        reactOn: false
    }, null, 2));
}

const channelInfo = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '01144534147@newsletter',
            newsletterName: 'Crazy Seif',
            serverMessageId: -1
        }
    }
};

async function readConfig() {
    try {
        if (HAS_DB) {
            const config = await store.getSetting('global', 'autoStatus');
            return config || { enabled: false, reactOn: false };
        } else {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            return {
                enabled: !!config.enabled,
                reactOn: !!config.reactOn
            };
        }
    } catch (error) {
        console.error('Ø®Ø·Ø£ ÙÙŠ Ù‚Ø±Ø§Ø¡Ø© Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ø­Ø§Ù„Ø© Ø§Ù„ØªÙ„Ù‚Ø§Ø¦ÙŠØ©:', error);
        return { enabled: false, reactOn: false };
    }
}

async function writeConfig(config) {
    try {
        if (HAS_DB) {
            await store.saveSetting('global', 'autoStatus', config);
        } else {
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        }
    } catch (error) {
        console.error('Ø®Ø·Ø£ ÙÙŠ Ø­ÙØ¸ Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ø­Ø§Ù„Ø© Ø§Ù„ØªÙ„Ù‚Ø§Ø¦ÙŠØ©:', error);
    }
}

async function isAutoStatusEnabled() {
    const config = await readConfig();
    return config.enabled;
}

async function isStatusReactionEnabled() {
    const config = await readConfig();
    return config.reactOn;
}

async function reactToStatus(sock, statusKey) {
    try {
        const enabled = await isStatusReactionEnabled();
        if (!enabled) return;
        
        await sock.relayMessage('status@broadcast', {
            reactionMessage: {
                key: {
                    remoteJid: 'status@broadcast',
                    id: statusKey.id,
                    participant: statusKey.participant || statusKey.remoteJid,
                    fromMe: false
                },
                text: 'ðŸ’š'
            }
        }, {
            messageId: statusKey.id,
            statusJidList: [statusKey.remoteJid, statusKey.participant || statusKey.remoteJid]
        });
        console.log('âœ… ØªÙ… Ø§Ù„ØªÙØ§Ø¹Ù„ Ù…Ø¹ Ø§Ù„Ø­Ø§Ù„Ø©');
    } catch (error) {
        console.error('âŒ Ø®Ø·Ø£ ÙÙŠ Ø§Ù„ØªÙØ§Ø¹Ù„ Ù…Ø¹ Ø§Ù„Ø­Ø§Ù„Ø©:', error.message);
    }
}

async function handleStatusUpdate(sock, status) {
    try {
        const enabled = await isAutoStatusEnabled();
        if (!enabled) return;
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (status.messages && status.messages.length > 0) {
            const msg = status.messages[0];
            if (msg.key && msg.key.remoteJid === 'status@broadcast') {
                try {
                    await sock.readMessages([msg.key]);
                    console.log('âœ… ØªÙ… Ù…Ø´Ø§Ù‡Ø¯Ø© Ø§Ù„Ø­Ø§Ù„Ø© Ù…Ù† Ø§Ù„Ø±Ø³Ø§Ø¦Ù„');
                    await reactToStatus(sock, msg.key);
                } catch (err) {
                    if (err.message?.includes('rate-overlimit')) {
                        console.log('âš ï¸ ØªÙ… ØªØ¬Ø§ÙˆØ² Ø§Ù„Ø­Ø¯ØŒ Ø§Ù†ØªØ¸Ø§Ø± Ù‚Ø¨Ù„ Ø¥Ø¹Ø§Ø¯Ø© Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø©...');
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        await sock.readMessages([msg.key]);
                    } else {
                        throw err;
                    }
                }
                return;
            }
        }
        
        if (status.key && status.key.remoteJid === 'status@broadcast') {
            try {
                await sock.readMessages([status.key]);
                console.log('âœ… ØªÙ… Ù…Ø´Ø§Ù‡Ø¯Ø© Ø§Ù„Ø­Ø§Ù„Ø© Ù…Ù† Ø§Ù„Ù…ÙØªØ§Ø­');
                await reactToStatus(sock, status.key);
            } catch (err) {
                if (err.message?.includes('rate-overlimit')) {
                    console.log('âš ï¸ ØªÙ… ØªØ¬Ø§ÙˆØ² Ø§Ù„Ø­Ø¯ØŒ Ø§Ù†ØªØ¸Ø§Ø± Ù‚Ø¨Ù„ Ø¥Ø¹Ø§Ø¯Ø© Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø©...');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    await sock.readMessages([status.key]);
                } else {
                    throw err;
                }
            }
            return;
        }
        
        if (status.reaction && status.reaction.key.remoteJid === 'status@broadcast') {
            try {
                await sock.readMessages([status.reaction.key]);
                console.log('âœ… ØªÙ… Ù…Ø´Ø§Ù‡Ø¯Ø© Ø§Ù„Ø­Ø§Ù„Ø© Ù…Ù† Ø§Ù„ØªÙØ§Ø¹Ù„');
                await reactToStatus(sock, status.reaction.key);
            } catch (err) {
                if (err.message?.includes('rate-overlimit')) {
                    console.log('âš ï¸ ØªÙ… ØªØ¬Ø§ÙˆØ² Ø§Ù„Ø­Ø¯ØŒ Ø§Ù†ØªØ¸Ø§Ø± Ù‚Ø¨Ù„ Ø¥Ø¹Ø§Ø¯Ø© Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø©...');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    await sock.readMessages([status.reaction.key]);
                } else {
                    throw err;
                }
            }
        }
    } catch (error) {
        console.error('âŒ Ø®Ø·Ø£ ÙÙŠ Ù…Ø´Ø§Ù‡Ø¯Ø© Ø§Ù„Ø­Ø§Ù„Ø© Ø§Ù„ØªÙ„Ù‚Ø§Ø¦ÙŠØ©:', error.message);
    }
}

export default {
    command: 'Ø­Ø§Ù„Ø§Øª',
    aliases: ['autostatus', 'autoview', 'statusview', 'Ø­Ø§Ù„Ø©_ØªÙ„Ù‚Ø§Ø¦ÙŠ', 'Ù…Ø´Ø§Ù‡Ø¯Ø©_Ø­Ø§Ù„Ø§Øª'],
    category: 'Ø§Ù„Ù…Ø§Ù„Ùƒ',
    description: 'Ù…Ø´Ø§Ù‡Ø¯Ø© ÙˆØªÙØ§Ø¹Ù„ ØªÙ„Ù‚Ø§Ø¦ÙŠ Ù…Ø¹ Ø­Ø§Ù„Ø§Øª Ø§Ù„ÙˆØ§ØªØ³Ø§Ø¨',
    usage: '!Ø­Ø§Ù„Ø§Øª <ÙˆÙ†|ÙˆÙÙ|ØªÙØ§Ø¹Ù„ ÙˆÙ†|ØªÙØ§Ø¹Ù„ ÙˆÙÙ>',
    ownerOnly: true,
    
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        
        try {
            const config = await readConfig();
            
            if (!args || args.length === 0) {
                const viewStatus = config.enabled ? 'âœ… Ù…ÙØ¹Ù„' : 'âŒ Ù…Ø¹Ø·Ù„';
                const reactStatus = config.reactOn ? 'âœ… Ù…ÙØ¹Ù„' : 'âŒ Ù…Ø¹Ø·Ù„';
                
                await sock.sendMessage(chatId, {
                    text: `ðŸ”„ *Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ø­Ø§Ù„Ø§Øª Ø§Ù„ØªÙ„Ù‚Ø§Ø¦ÙŠØ©*\n\n` +
                        `ðŸ“± *Ù…Ø´Ø§Ù‡Ø¯Ø© Ø§Ù„Ø­Ø§Ù„Ø§Øª:* ${viewStatus}\n` +
                        `ðŸ’« *Ø§Ù„ØªÙØ§Ø¹Ù„ Ù…Ø¹ Ø§Ù„Ø­Ø§Ù„Ø§Øª:* ${reactStatus}\n` +
                        `ðŸ—„ï¸ *Ø§Ù„ØªØ®Ø²ÙŠÙ†:* ${HAS_DB ? 'Ù‚Ø§Ø¹Ø¯Ø© Ø¨ÙŠØ§Ù†Ø§Øª' : 'Ù…Ù„ÙØ§Øª'}\n\n` +
                        `*Ø§Ù„Ø£ÙˆØ§Ù…Ø±:*\n` +
                        `â€¢ \`!Ø­Ø§Ù„Ø§Øª on\` - ØªÙØ¹ÙŠÙ„ Ø§Ù„Ù…Ø´Ø§Ù‡Ø¯Ø© Ø§Ù„ØªÙ„Ù‚Ø§Ø¦ÙŠØ©\n` +
                        `â€¢ \`!Ø­Ø§Ù„Ø§Øª off\` - ØªØ¹Ø·ÙŠÙ„ Ø§Ù„Ù…Ø´Ø§Ù‡Ø¯Ø© Ø§Ù„ØªÙ„Ù‚Ø§Ø¦ÙŠØ©\n` +
                        `â€¢ \`!Ø­Ø§Ù„Ø§Øª ØªÙØ§Ø¹Ù„ on\` - ØªÙØ¹ÙŠÙ„ Ø§Ù„ØªÙØ§Ø¹Ù„\n` +
                        `â€¢ \`!Ø­Ø§Ù„Ø§Øª ØªÙØ§Ø¹Ù„ off\` - ØªØ¹Ø·ÙŠÙ„ Ø§Ù„ØªÙØ§Ø¹Ù„`,
                    ...channelInfo
                }, { quoted: message });
                return;
            }
            
            const command = args[0].toLowerCase();
            
            if (command === 'on') {
                config.enabled = true;
                await writeConfig(config);
                await sock.sendMessage(chatId, {
                    text: 'âœ… *ØªÙ… ØªÙØ¹ÙŠÙ„ Ù…Ø´Ø§Ù‡Ø¯Ø© Ø§Ù„Ø­Ø§Ù„Ø§Øª Ø§Ù„ØªÙ„Ù‚Ø§Ø¦ÙŠØ©!*\n\n' +
                        'Ø³ÙŠÙ‚ÙˆÙ… Ø§Ù„Ø¨ÙˆØª Ø§Ù„Ø¢Ù† Ø¨Ù…Ø´Ø§Ù‡Ø¯Ø© Ø¬Ù…ÙŠØ¹ Ø­Ø§Ù„Ø§Øª Ø¬Ù‡Ø§Øª Ø§Ù„Ø§ØªØµØ§Ù„.',
                    ...channelInfo
                }, { quoted: message });
                
            } else if (command === 'off') {
                config.enabled = false;
                await writeConfig(config);
                await sock.sendMessage(chatId, {
                    text: 'âŒ *ØªÙ… ØªØ¹Ø·ÙŠÙ„ Ù…Ø´Ø§Ù‡Ø¯Ø© Ø§Ù„Ø­Ø§Ù„Ø§Øª Ø§Ù„ØªÙ„Ù‚Ø§Ø¦ÙŠØ©!*\n\n' +
                        'Ù„Ù† ÙŠÙ‚ÙˆÙ… Ø§Ù„Ø¨ÙˆØª Ø¨Ù…Ø´Ø§Ù‡Ø¯Ø© Ø§Ù„Ø­Ø§Ù„Ø§Øª ØªÙ„Ù‚Ø§Ø¦ÙŠØ§Ù‹.',
                    ...channelInfo
                }, { quoted: message });
                
            } else if (command === 'ØªÙØ§Ø¹Ù„' || command === 'react') {
                if (!args[1]) {
                    await sock.sendMessage(chatId, {
                        text: 'âŒ *Ø§Ù„Ø±Ø¬Ø§Ø¡ ØªØ­Ø¯ÙŠØ¯ on/off Ù„Ù„ØªÙØ§Ø¹Ù„Ø§Øª!*\n\n' +
                            'Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…: `!Ø­Ø§Ù„Ø§Øª ØªÙØ§Ø¹Ù„ on/off`',
                        ...channelInfo
                    }, { quoted: message });
                    return;
                }
                
                const reactCommand = args[1].toLowerCase();
                
                if (reactCommand === 'on') {
                    config.reactOn = true;
                    await writeConfig(config);
                    await sock.sendMessage(chatId, {
                        text: 'ðŸ’« *ØªÙ… ØªÙØ¹ÙŠÙ„ Ø§Ù„ØªÙØ§Ø¹Ù„ Ù…Ø¹ Ø§Ù„Ø­Ø§Ù„Ø§Øª!*\n\n' +
                            'Ø³ÙŠÙ‚ÙˆÙ… Ø§Ù„Ø¨ÙˆØª Ø¨Ø§Ù„ØªÙØ§Ø¹Ù„ Ù…Ø¹ Ø§Ù„Ø­Ø§Ù„Ø§Øª Ø¨Ù€ ðŸ’š',
                        ...channelInfo
                    }, { quoted: message });
                    
                } else if (reactCommand === 'off') {
                    config.reactOn = false;
                    await writeConfig(config);
                    await sock.sendMessage(chatId, {
                        text: 'âŒ *ØªÙ… ØªØ¹Ø·ÙŠÙ„ Ø§Ù„ØªÙØ§Ø¹Ù„ Ù…Ø¹ Ø§Ù„Ø­Ø§Ù„Ø§Øª!*\n\n' +
                            'Ù„Ù† ÙŠÙ‚ÙˆÙ… Ø§Ù„Ø¨ÙˆØª Ø¨Ø§Ù„ØªÙØ§Ø¹Ù„ Ù…Ø¹ Ø§Ù„Ø­Ø§Ù„Ø§Øª.',
                        ...channelInfo
                    }, { quoted: message });
                    
                } else {
                    await sock.sendMessage(chatId, {
                        text: 'âŒ *Ø£Ù…Ø± ØªÙØ§Ø¹Ù„ ØºÙŠØ± ØµØ­ÙŠØ­!*\n\n' +
                            'Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…: `!Ø­Ø§Ù„Ø§Øª ØªÙØ§Ø¹Ù„ on/off`',
                        ...channelInfo
                    }, { quoted: message });
                }
                
            } else {
                await sock.sendMessage(chatId, {
                    text: 'âŒ *Ø£Ù…Ø± ØºÙŠØ± ØµØ­ÙŠØ­!*\n\n' +
                        '*Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…:*\n' +
                        'â€¢ `!Ø­Ø§Ù„Ø§Øª on/off` - ØªÙØ¹ÙŠÙ„/ØªØ¹Ø·ÙŠÙ„ Ø§Ù„Ù…Ø´Ø§Ù‡Ø¯Ø© Ø§Ù„ØªÙ„Ù‚Ø§Ø¦ÙŠØ©\n' +
                        'â€¢ `!Ø­Ø§Ù„Ø§Øª ØªÙØ§Ø¹Ù„ on/off` - ØªÙØ¹ÙŠÙ„/ØªØ¹Ø·ÙŠÙ„ Ø§Ù„ØªÙØ§Ø¹Ù„Ø§Øª',
                    ...channelInfo
                }, { quoted: message });
            }
            
        } catch (error) {
            console.error('Ø®Ø·Ø£ ÙÙŠ Ø£Ù…Ø± Ø§Ù„Ø­Ø§Ù„Ø§Øª Ø§Ù„ØªÙ„Ù‚Ø§Ø¦ÙŠØ©:', error);
            await sock.sendMessage(chatId, {
                text: 'âŒ *Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ø­Ø§Ù„Ø§Øª Ø§Ù„ØªÙ„Ù‚Ø§Ø¦ÙŠØ©!*\n\n' +
                    `Ø§Ù„Ø®Ø·Ø£: ${error.message}`,
                ...channelInfo
            }, { quoted: message });
        }
    },
    handleStatusUpdate,
    isAutoStatusEnabled,
    isStatusReactionEnabled,
    reactToStatus,
    readConfig,
    writeConfig
};

