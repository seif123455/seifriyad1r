import fs from 'fs';
import store from '../lib/lightweight_store.js';

const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);
const bannedFilePath = './data/banned.json';

async function getBannedUsers() {
    if (HAS_DB) {
        const banned = await store.getSetting('global', 'banned');
        return banned || [];
    } else {
        if (fs.existsSync(bannedFilePath)) {
            return JSON.parse(fs.readFileSync(bannedFilePath, "utf-8"));
        }
        return [];
    }
}

async function saveBannedUsers(bannedUsers) {
    if (HAS_DB) {
        await store.saveSetting('global', 'banned', bannedUsers);
    } else {
        if (!fs.existsSync('./data')) {
            fs.mkdirSync('./data', { recursive: true });
        }
        fs.writeFileSync(bannedFilePath, JSON.stringify(bannedUsers, null, 2));
    }
}

export default {
    command: 'Ø§Ù„ØºØ§Ø¡_Ø­Ø¸Ø±',
    aliases: ['unban', 'pardon', 'Ø§Ù„ØºØ§Ø¡_Ø§Ù„Ù…Ù†Ø¹', 'ÙÙƒ_Ø§Ù„Ø­Ø¸Ø±'],
    category: 'Ø§Ù„Ù…Ø´Ø±ÙÙˆÙ†',
    description: 'Ø¥Ù„ØºØ§Ø¡ Ø­Ø¸Ø± Ù…Ø³ØªØ®Ø¯Ù… Ù…Ù† Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ø¨ÙˆØª',
    usage: '!Ø§Ù„ØºØ§Ø¡_Ø­Ø¸Ø± [@Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…] Ø£Ùˆ Ø±Ø¯ Ø¹Ù„Ù‰ Ø±Ø³Ø§Ù„Ø©',
    ownerOnly: false,
    
    async handler(sock, message, args, context) {
        const { chatId, isGroup, channelInfo, senderIsOwnerOrSudo, isSenderAdmin, isBotAdmin } = context;
        
        if (isGroup) {
            if (!isBotAdmin) {
                await sock.sendMessage(chatId, {
                    text: 'âš ï¸ *Ø§Ù„ØºØ§Ø¡ Ø§Ù„Ø­Ø¸Ø±*\n\nØ§Ù„Ø±Ø¬Ø§Ø¡ Ø¬Ø¹Ù„ Ø§Ù„Ø¨ÙˆØª Ø£Ø¯Ù…Ù† Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù… Ù‡Ø°Ø§ Ø§Ù„Ø£Ù…Ø±.',
                    ...channelInfo
                }, { quoted: message });
                return;
            }
            if (!isSenderAdmin && !message.key.fromMe && !senderIsOwnerOrSudo) {
                await sock.sendMessage(chatId, {
                    text: 'âš ï¸ *Ø§Ù„ØºØ§Ø¡ Ø§Ù„Ø­Ø¸Ø±*\n\nÙÙ‚Ø· Ù…Ø´Ø±ÙÙŠ Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹Ø© ÙŠÙ…ÙƒÙ†Ù‡Ù… Ø§Ø³ØªØ®Ø¯Ø§Ù… Ù‡Ø°Ø§ Ø§Ù„Ø£Ù…Ø±.',
                    ...channelInfo
                }, { quoted: message });
                return;
            }
        } else {
            if (!message.key.fromMe && !senderIsOwnerOrSudo) {
                await sock.sendMessage(chatId, {
                    text: 'âš ï¸ *Ø§Ù„ØºØ§Ø¡ Ø§Ù„Ø­Ø¸Ø±*\n\nÙÙ‚Ø· Ø§Ù„Ù…Ø§Ù„Ùƒ ÙŠÙ…ÙƒÙ†Ù‡ Ø§Ø³ØªØ®Ø¯Ø§Ù… Ù‡Ø°Ø§ Ø§Ù„Ø£Ù…Ø± ÙÙŠ Ø§Ù„Ø®Ø§Øµ.',
                    ...channelInfo
                }, { quoted: message });
                return;
            }
        }
        
        let userToUnban;
        
        if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            userToUnban = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
        } else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
            userToUnban = message.message.extendedTextMessage.contextInfo.participant;
        }
        
        if (!userToUnban) {
            await sock.sendMessage(chatId, {
                text: 'ðŸ‘¤ *Ø§Ù„ØºØ§Ø¡ Ø§Ù„Ø­Ø¸Ø±*\n\n' +
                    '*Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…:* `!Ø§Ù„ØºØ§Ø¡_Ø­Ø¸Ø± @Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…`\n' +
                    '*Ù…Ø«Ø§Ù„:* `!Ø§Ù„ØºØ§Ø¡_Ø­Ø¸Ø± @username`\n\n' +
                    '*Ø£Ùˆ Ø±Ø¯ Ø¹Ù„Ù‰ Ø±Ø³Ø§Ù„Ø© Ø§Ù„Ø´Ø®Øµ Ø«Ù… Ø§ÙƒØªØ¨:* `!Ø§Ù„ØºØ§Ø¡_Ø­Ø¸Ø±`',
                ...channelInfo
            }, { quoted: message });
            return;
        }
        
        try {
            const bannedUsers = await getBannedUsers();
            const index = bannedUsers.indexOf(userToUnban);
            
            if (index > -1) {
                bannedUsers.splice(index, 1);
                await saveBannedUsers(bannedUsers);
                
                const userName = sock.store?.contacts?.[userToUnban]?.name || 
                               sock.store?.contacts?.[userToUnban]?.notify || 
                               userToUnban.split('@')[0];
                
                await sock.sendMessage(chatId, {
                    text: `âœ… *ØªÙ… Ø¥Ù„ØºØ§Ø¡ Ø§Ù„Ø­Ø¸Ø±*\n\n` +
                        `â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”“\n` +
                        `â”ƒ ðŸ‘¤ *Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…:* ${userName}\n` +
                        `â”ƒ ðŸ†” *Ø§Ù„Ø±Ù‚Ù…:* @${userToUnban.split('@')[0]}\n` +
                        `â”£â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”«\n` +
                        `â”ƒ ðŸ’¾ *Ø§Ù„ØªØ®Ø²ÙŠÙ†:* ${HAS_DB ? 'Ù‚Ø§Ø¹Ø¯Ø© Ø¨ÙŠØ§Ù†Ø§Øª' : 'Ù…Ù„ÙØ§Øª'}\n` +
                        `â”—â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”›\n\n` +
                        `ðŸ”¥ *Crazy Seif BOT* | ðŸ“ž 01144534147`,
                    mentions: [userToUnban],
                    ...channelInfo
                }, { quoted: message });
            } else {
                await sock.sendMessage(chatId, {
                    text: `âš ï¸ *Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… ØºÙŠØ± Ù…Ø­Ø¸ÙˆØ±*\n\n@${userToUnban.split('@')[0]} Ù„ÙŠØ³ Ù…Ø­Ø¸ÙˆØ±Ø§Ù‹ Ù…Ù† Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ø¨ÙˆØª.`,
                    mentions: [userToUnban],
                    ...channelInfo
                }, { quoted: message });
            }
        } catch (error) {
            console.error('Ø®Ø·Ø£ ÙÙŠ Ø£Ù…Ø± Ø¥Ù„ØºØ§Ø¡ Ø§Ù„Ø­Ø¸Ø±:', error);
            await sock.sendMessage(chatId, {
                text: 'âŒ ÙØ´Ù„ ÙÙŠ Ø¥Ù„ØºØ§Ø¡ Ø­Ø¸Ø± Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…!',
                ...channelInfo
            }, { quoted: message });
        }
    }
};

