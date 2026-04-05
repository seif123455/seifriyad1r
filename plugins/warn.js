import fs from 'fs';
import path from 'path';
import store from '../lib/lightweight_store.js';

const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);
const databaseDir = path.join(process.cwd(), 'data');
const warningsPath = path.join(databaseDir, 'warnings.json');

function initializeWarningsFile() {
    if (!HAS_DB) {
        if (!fs.existsSync(databaseDir)) {
            fs.mkdirSync(databaseDir, { recursive: true });
        }
        if (!fs.existsSync(warningsPath)) {
            fs.writeFileSync(warningsPath, JSON.stringify({}), 'utf8');
        }
    }
}

async function getWarnings() {
    if (HAS_DB) {
        const warnings = await store.getSetting('global', 'warnings');
        return warnings || {};
    } else {
        try {
            return JSON.parse(fs.readFileSync(warningsPath, 'utf8'));
        } catch (error) {
            return {};
        }
    }
}

async function saveWarnings(warnings) {
    if (HAS_DB) {
        await store.saveSetting('global', 'warnings', warnings);
    } else {
        fs.writeFileSync(warningsPath, JSON.stringify(warnings, null, 2));
    }
}

export default {
    command: 'ØªØ­Ø°ÙŠØ±',
    aliases: ['warn', 'warning', 'Ø§Ù†Ø°Ø§Ø±'],
    category: 'Ø§Ù„Ù…Ø´Ø±ÙÙˆÙ†',
    description: 'ØªØ­Ø°ÙŠØ± Ù…Ø³ØªØ®Ø¯Ù… (Ø§Ù„Ø·Ø±Ø¯ Ø§Ù„ØªÙ„Ù‚Ø§Ø¦ÙŠ Ø¨Ø¹Ø¯ 3 ØªØ­Ø°ÙŠØ±Ø§Øª)',
    usage: '!ØªØ­Ø°ÙŠØ± [@Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…] Ø£Ùˆ Ø±Ø¯ Ø¹Ù„Ù‰ Ø±Ø³Ø§Ù„Ø©',
    groupOnly: true,
    adminOnly: true,
    
    async handler(sock, message, args, context) {
        const { chatId, senderId, channelInfo } = context;
        
        try {
            initializeWarningsFile();
            
            let userToWarn;
            const mentionedJids = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            
            if (mentionedJids && mentionedJids.length > 0) {
                userToWarn = mentionedJids[0];
            } else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
                userToWarn = message.message.extendedTextMessage.contextInfo.participant;
            }
            
            if (!userToWarn) {
                await sock.sendMessage(chatId, {
                    text: 'âš ï¸ *ØªØ­Ø°ÙŠØ± Ù…Ø³ØªØ®Ø¯Ù…*\n\n' +
                        '*Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…:* `!ØªØ­Ø°ÙŠØ± @Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…`\n' +
                        '*Ù…Ø«Ø§Ù„:* `!ØªØ­Ø°ÙŠØ± @username`\n\n' +
                        '*Ø£Ùˆ Ø±Ø¯ Ø¹Ù„Ù‰ Ø±Ø³Ø§Ù„Ø© Ø§Ù„Ø´Ø®Øµ Ø«Ù… Ø§ÙƒØªØ¨:* `!ØªØ­Ø°ÙŠØ±`',
                    ...channelInfo
                }, { quoted: message });
                return;
            }
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            try {
                const warnings = await getWarnings();
                if (!warnings[chatId]) warnings[chatId] = {};
                if (!warnings[chatId][userToWarn]) warnings[chatId][userToWarn] = 0;
                
                warnings[chatId][userToWarn]++;
                await saveWarnings(warnings);
                
                const userName = sock.store?.contacts?.[userToWarn]?.name || 
                               sock.store?.contacts?.[userToWarn]?.notify || 
                               userToWarn.split('@')[0];
                
                const warningCount = warnings[chatId][userToWarn];
                let remainingWarns = 3 - warningCount;
                let warnStatus = '';
                
                if (remainingWarns === 2) {
                    warnStatus = 'âš ï¸ ØªØ­Ø°ÙŠØ± ÙˆØ§Ø­Ø¯ Ù…ØªØ¨Ù‚ÙŠ Ù‚Ø¨Ù„ Ø§Ù„Ø·Ø±Ø¯';
                } else if (remainingWarns === 1) {
                    warnStatus = 'ðŸ”´ ØªØ­Ø°ÙŠØ± Ø£Ø®ÙŠØ±!';
                } else {
                    warnStatus = 'Ø³ÙŠØªÙ… Ø·Ø±Ø¯ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…';
                }
                
                const warningMessage = `*ã€Ž âš ï¸ ØªØ­Ø°ÙŠØ± ã€*\n\n` +
                    `ðŸ‘¤ *Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…:* ${userName}\n` +
                    `âš ï¸ *Ø¹Ø¯Ø¯ Ø§Ù„ØªØ­Ø°ÙŠØ±Ø§Øª:* ${warningCount}/3\n` +
                    `ðŸ“Š *Ø§Ù„Ù…ØªØ¨Ù‚ÙŠ:* ${remainingWarns} ØªØ­Ø°ÙŠØ±Ø§Øª\n` +
                    `ðŸ‘‘ *ØªÙ… Ø¨ÙˆØ§Ø³Ø·Ø©:* @${senderId.split('@')[0]}\n` +
                    `ðŸ’¾ *Ø§Ù„ØªØ®Ø²ÙŠÙ†:* ${HAS_DB ? 'Ù‚Ø§Ø¹Ø¯Ø© Ø¨ÙŠØ§Ù†Ø§Øª' : 'Ù…Ù„ÙØ§Øª'}\n\n` +
                    `ðŸ“… *Ø§Ù„ØªØ§Ø±ÙŠØ®:* ${new Date().toLocaleString('ar-EG')}\n\n` +
                    `${warnStatus === 'Ø³ÙŠØªÙ… Ø·Ø±Ø¯ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…' ? 'ðŸš« Ø³ÙŠØªÙ… Ø·Ø±Ø¯ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… ØªÙ„Ù‚Ø§Ø¦ÙŠØ§Ù‹ Ø¨Ø¹Ø¯ 3 ØªØ­Ø°ÙŠØ±Ø§Øª!' : `âš ï¸ ${warnStatus}`}`;
                
                await sock.sendMessage(chatId, {
                    text: warningMessage,
                    mentions: [userToWarn, senderId],
                    ...channelInfo
                });
                
                if (warnings[chatId][userToWarn] >= 3) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    await sock.groupParticipantsUpdate(chatId, [userToWarn], "remove");
                    delete warnings[chatId][userToWarn];
                    await saveWarnings(warnings);
                    
                    const kickMessage = `*ã€Ž ðŸš« Ø·Ø±Ø¯ ØªÙ„Ù‚Ø§Ø¦ÙŠ ã€*\n\n` +
                        `@${userToWarn.split('@')[0]} ØªÙ… Ø·Ø±Ø¯Ù‡ Ù…Ù† Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹Ø© Ø¨Ø¹Ø¯ ÙˆØµÙˆÙ„Ù‡ Ù„Ù€ 3 ØªØ­Ø°ÙŠØ±Ø§Øª! âš ï¸\n\n` +
                        `ðŸ”¥ *Crazy Seif BOT* | ðŸ“ž 01144534147`;
                    
                    await sock.sendMessage(chatId, {
                        text: kickMessage,
                        mentions: [userToWarn],
                        ...channelInfo
                    });
                }
                
            } catch (error) {
                console.error('Ø®Ø·Ø£ ÙÙŠ Ø£Ù…Ø± Ø§Ù„ØªØ­Ø°ÙŠØ±:', error);
                await sock.sendMessage(chatId, {
                    text: 'âŒ ÙØ´Ù„ ÙÙŠ ØªØ­Ø°ÙŠØ± Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…!',
                    ...channelInfo
                }, { quoted: message });
            }
            
        } catch (error) {
            console.error('Ø®Ø·Ø£ ÙÙŠ Ø£Ù…Ø± Ø§Ù„ØªØ­Ø°ÙŠØ±:', error);
            
            if (error.data === 429) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                try {
                    await sock.sendMessage(chatId, {
                        text: 'âŒ ØªÙ… ØªØ¬Ø§Ø§Ø² Ø§Ù„Ø­Ø¯ Ø§Ù„Ù…Ø³Ù…ÙˆØ­. Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰ Ø¨Ø¹Ø¯ Ø¨Ø¶Ø¹ Ø«ÙˆØ§Ù†Ù.',
                        ...channelInfo
                    }, { quoted: message });
                } catch (retryError) {
                    console.error('Ø®Ø·Ø£ ÙÙŠ Ø¥Ø±Ø³Ø§Ù„ Ø±Ø³Ø§Ù„Ø© Ø¥Ø¹Ø§Ø¯Ø© Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø©:', retryError);
                }
            } else {
                try {
                    await sock.sendMessage(chatId, {
                        text: 'âŒ ÙØ´Ù„ ÙÙŠ ØªØ­Ø°ÙŠØ± Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…. ØªØ£ÙƒØ¯ Ù…Ù† Ø£Ù† Ø§Ù„Ø¨ÙˆØª Ø£Ø¯Ù…Ù† ÙˆÙ„Ø¯ÙŠÙ‡ Ø§Ù„ØµÙ„Ø§Ø­ÙŠØ§Øª Ø§Ù„ÙƒØ§ÙÙŠØ©.',
                        ...channelInfo
                    }, { quoted: message });
                } catch (sendError) {
                    console.error('Ø®Ø·Ø£ ÙÙŠ Ø¥Ø±Ø³Ø§Ù„ Ø±Ø³Ø§Ù„Ø© Ø§Ù„Ø®Ø·Ø£:', sendError);
                }
            }
        }
    }
};

