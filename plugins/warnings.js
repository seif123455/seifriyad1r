import fs from 'fs';
import { dataFile } from '../lib/paths.js';
import store from '../lib/lightweight_store.js';

const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);
const warningsFilePath = dataFile('warnings.json');

async function loadWarnings() {
    if (HAS_DB) {
        const warnings = await store.getSetting('global', 'warnings');
        return warnings || {};
    } else {
        if (!fs.existsSync(warningsFilePath)) {
            fs.writeFileSync(warningsFilePath, JSON.stringify({}), 'utf8');
        }
        const data = fs.readFileSync(warningsFilePath, 'utf8');
        return JSON.parse(data);
    }
}

export default {
    command: 'ØªØ­Ø°ÙŠØ±Ø§Øª',
    aliases: ['warnings', 'checkwarn', 'warncount', 'Ø¹Ø¯Ø¯_Ø§Ù„ØªØ­Ø°ÙŠØ±Ø§Øª', 'ØªØ­Ø°ÙŠØ±'],
    category: 'Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹Ø©',
    description: 'Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø¹Ø¯Ø¯ ØªØ­Ø°ÙŠØ±Ø§Øª Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…',
    usage: '!ØªØ­Ø°ÙŠØ±Ø§Øª @Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…',
    groupOnly: true,
    
    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        const mentionedJidList = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        
        if (mentionedJidList.length === 0) {
            await sock.sendMessage(chatId, {
                text: 'âš ï¸ *Ø§Ù„ØªØ­Ø°ÙŠØ±Ø§Øª*\n\n' +
                    '*Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…:* `!ØªØ­Ø°ÙŠØ±Ø§Øª @Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…`\n' +
                    '*Ù…Ø«Ø§Ù„:* `!ØªØ­Ø°ÙŠØ±Ø§Øª @username`\n\n' +
                    '*Ø£Ùˆ Ø±Ø¯ Ø¹Ù„Ù‰ Ø±Ø³Ø§Ù„Ø© Ø§Ù„Ø´Ø®Øµ Ø«Ù… Ø§ÙƒØªØ¨:* `!ØªØ­Ø°ÙŠØ±Ø§Øª`',
                ...channelInfo
            }, { quoted: message });
            return;
        }
        
        const userToCheck = mentionedJidList[0];
        const warnings = await loadWarnings();
        const warningCount = (warnings[chatId] && warnings[chatId][userToCheck]) || 0;
        
        const userName = sock.store?.contacts?.[userToCheck]?.name || 
                       sock.store?.contacts?.[userToCheck]?.notify || 
                       userToCheck.split('@')[0];
        
        let statusText = '';
        if (warningCount === 0) {
            statusText = 'âœ… Ù„ÙŠØ³ Ù„Ø¯ÙŠÙ‡ Ø£ÙŠ ØªØ­Ø°ÙŠØ±Ø§Øª';
        } else if (warningCount === 1) {
            statusText = 'âš ï¸ ØªØ­Ø°ÙŠØ± ÙˆØ§Ø­Ø¯';
        } else if (warningCount <= 3) {
            statusText = 'âš ï¸âš ï¸ ØªØ­Ø°ÙŠØ±Ø§Øª Ù‚Ù„ÙŠÙ„Ø©';
        } else {
            statusText = 'ðŸ”´ ØªØ­Ø°ÙŠØ±Ø§Øª ÙƒØ«ÙŠØ±Ø©!';
        }
        
        await sock.sendMessage(chatId, {
            text: `âš ï¸ *ØªØ­Ø°ÙŠØ±Ø§Øª Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…*\n\n` +
                `â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”“\n` +
                `â”ƒ ðŸ‘¤ *Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…:* ${userName}\n` +
                `â”ƒ ðŸ†” *Ø§Ù„Ø±Ù‚Ù…:* @${userToCheck.split('@')[0]}\n` +
                `â”£â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”«\n` +
                `â”ƒ ðŸ“Š *Ø¹Ø¯Ø¯ Ø§Ù„ØªØ­Ø°ÙŠØ±Ø§Øª:* ${warningCount}\n` +
                `â”ƒ ðŸ“ *Ø§Ù„Ø­Ø§Ù„Ø©:* ${statusText}\n` +
                `â”—â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”›\n\n` +
                `ðŸ’¾ *Ø§Ù„ØªØ®Ø²ÙŠÙ†:* ${HAS_DB ? 'Ù‚Ø§Ø¹Ø¯Ø© Ø¨ÙŠØ§Ù†Ø§Øª' : 'Ù…Ù„ÙØ§Øª'}\n\n` +
                `ðŸ”¥ *Crazy Seif BOT* | ðŸ“ž 01144534147`,
            mentions: [userToCheck],
            ...channelInfo
        }, { quoted: message });
    }
};

