import config from '../config.js';
import CommandHandler from '../lib/commandHandler.js';
import fs from 'fs';
import path from 'path';

const menuEmojis = ['âœ¨', 'ðŸŒŸ', 'â­', 'ðŸ’«', 'ðŸŽ¯', 'ðŸŽ¨', 'ðŸŽª', 'ðŸŽ­', 'ðŸ”¥', 'ðŸ’Ž'];
const activeEmojis = ['âœ…', 'ðŸŸ¢', 'ðŸ’š', 'âœ”ï¸', 'â˜‘ï¸'];
const disabledEmojis = ['âŒ', 'ðŸ”´', 'â›”', 'ðŸš«', 'âŽ'];
const fastEmojis = ['âš¡', 'ðŸš€', 'ðŸ’¨', 'â±ï¸', 'ðŸ”¥'];
const slowEmojis = ['ðŸ¢', 'ðŸŒ', 'â³', 'âŒ›', 'ðŸ•'];

const categoryEmojis = {
    general: ['ðŸ“±', 'ðŸ”§', 'âš™ï¸', 'ðŸ› ï¸'],
    owner: ['ðŸ‘‘', 'ðŸ”±', 'ðŸ’Ž', 'ðŸŽ–ï¸'],
    admin: ['ðŸ›¡ï¸', 'âš”ï¸', 'ðŸ”', 'ðŸ‘®'],
    group: ['ðŸ‘¥', 'ðŸ‘«', 'ðŸ§‘â€ðŸ¤â€ðŸ§‘', 'ðŸ‘¨â€ðŸ‘©â€ðŸ‘§â€ðŸ‘¦'],
    download: ['ðŸ“¥', 'â¬‡ï¸', 'ðŸ’¾', 'ðŸ“¦'],
    ai: ['ðŸ¤–', 'ðŸ§ ', 'ðŸ’­', 'ðŸŽ¯'],
    search: ['ðŸ”', 'ðŸ”Ž', 'ðŸ•µï¸', 'ðŸ“¡'],
    apks: ['ðŸ“²', 'ðŸ“¦', 'ðŸ’¿', 'ðŸ—‚ï¸'],
    info: ['â„¹ï¸', 'ðŸ“‹', 'ðŸ“Š', 'ðŸ“„'],
    fun: ['ðŸŽ®', 'ðŸŽ²', 'ðŸŽ°', 'ðŸŽª'],
    stalk: ['ðŸ‘€', 'ðŸ”­', 'ðŸ•µï¸', 'ðŸŽ¯'],
    games: ['ðŸŽ®', 'ðŸ•¹ï¸', 'ðŸŽ¯', 'ðŸ†'],
    images: ['ðŸ–¼ï¸', 'ðŸ“¸', 'ðŸŽ¨', 'ðŸŒ„'],
    menu: ['ðŸ“œ', 'ðŸ“‹', 'ðŸ“‘', 'ðŸ“š'],
    tools: ['ðŸ”¨', 'ðŸ”§', 'âš¡', 'ðŸ› ï¸'],
    stickers: ['ðŸŽ­', 'ðŸ˜€', 'ðŸŽ¨', 'ðŸ–¼ï¸'],
    quotes: ['ðŸ’¬', 'ðŸ“–', 'âœï¸', 'ðŸ’­'],
    music: ['ðŸŽµ', 'ðŸŽ¶', 'ðŸŽ§', 'ðŸŽ¤'],
    utility: ['ðŸ“‚', 'ðŸ”§', 'âš™ï¸', 'ðŸ› ï¸']
};

function getRandomEmoji(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getCategoryEmoji(category) {
    const emojis = categoryEmojis[category.toLowerCase()] || ['ðŸ“‚', 'ðŸ“', 'ðŸ—‚ï¸', 'ðŸ“‹'];
    return getRandomEmoji(emojis);
}

function formatTime() {
    const now = new Date();
    const options = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: config.timeZone || 'Africa/Cairo'
    };
    return now.toLocaleTimeString('en-US', options);
}

export default {
    command: 'Ù…Ù†ÙŠÙˆ',
    aliases: ['menu', 'smenu', 'shelp', 'smart', 'help2', 'Ø§Ù„Ù‚Ø§Ø¦Ù…Ø©', 'Ø§Ù„Ø§ÙˆØ§Ù…Ø±'],
    category: 'Ø¹Ø§Ù…',
    description: 'Ø¹Ø±Ø¶ Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ø£ÙˆØ§Ù…Ø±',
    usage: '!Ù…Ù†ÙŠÙˆ',
    isPrefixless: false,
    
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        
        try {
            const imagePath = path.join(process.cwd(), 'assets/thumb.png');
            const thumbnail = fs.existsSync(imagePath) ? fs.readFileSync(imagePath) : null;
            
            const categories = Array.from(CommandHandler.categories.keys());
            const stats = CommandHandler.getDiagnostics();
            
            const menuEmoji = getRandomEmoji(menuEmojis);
            const activeEmoji = getRandomEmoji(activeEmojis);
            const disabledEmoji = getRandomEmoji(disabledEmojis);
            const fastEmoji = getRandomEmoji(fastEmojis);
            const slowEmoji = getRandomEmoji(slowEmojis);
            
            let menuText = `â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”“\n`;
            menuText += `â”ƒ ${menuEmoji} *Crazy Seif BOT* ${menuEmoji}\n`;
            menuText += `â”£â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”«\n`;
            menuText += `â”ƒ ðŸ”¥ *Ø§Ù„Ø§Ø³Ù…:* ${config.botName || 'Crazy Seif'}\n`;
            menuText += `â”ƒ ðŸ‘¤ *Ø§Ù„Ù…Ø§Ù„Ùƒ:* Crazy Seif\n`;
            menuText += `â”ƒ ðŸ“ž *Ù„Ù„ØªÙˆØ§ØµÙ„:* 01144534147\n`;
            menuText += `â”ƒ â° *Ø§Ù„ÙˆÙ‚Øª:* ${formatTime()}\n`;
            menuText += `â”ƒ âš¡ *Ø§Ù„Ø¨Ø§Ø¯Ø¦Ø©:* !\n`;
            menuText += `â”ƒ ðŸ“Š *Ø§Ù„Ø£ÙˆØ§Ù…Ø±:* ${CommandHandler.commands.size}\n`;
            menuText += `â”£â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”«\n\n`;
            
            const topCmds = stats.slice(0, 3).filter(s => s.usage > 0);
            if (topCmds.length > 0) {
                menuText += `ðŸ”¥ *Ø§Ù„Ø£ÙƒØ«Ø± Ø§Ø³ØªØ®Ø¯Ø§Ù…Ø§Ù‹:* ðŸ”¥\n`;
                menuText += `â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”\n`;
                topCmds.forEach((c, i) => {
                    const rank = i === 0 ? 'ðŸ¥‡' : i === 1 ? 'ðŸ¥ˆ' : 'ðŸ¥‰';
                    menuText += `â”‚ ${rank} !${c.command} â€¢ ${c.usage} Ø§Ø³ØªØ®Ø¯Ø§Ù…\n`;
                });
                menuText += `â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜\n\n`;
            }
            
            for (const cat of categories) {
                const catEmoji = getCategoryEmoji(cat);
                const categoryTranslations = {
                    owner: 'Ø§Ù„Ù…Ø§Ù„Ùƒ',
                    group: 'Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹Ø§Øª',
                    admin: 'Ø§Ù„Ù…Ø´Ø±ÙÙŠÙ†',
                    download: 'Ø§Ù„ØªØ­Ù…ÙŠÙ„',
                    ai: 'Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ',
                    search: 'Ø§Ù„Ø¨Ø­Ø«',
                    fun: 'Ø§Ù„ØªØ³Ù„ÙŠØ©',
                    games: 'Ø§Ù„Ø£Ù„Ø¹Ø§Ø¨',
                    tools: 'Ø§Ù„Ø£Ø¯ÙˆØ§Øª',
                    utility: 'Ø§Ù„Ù…Ø±Ø§ÙÙ‚',
                    general: 'Ø§Ù„Ø¹Ø§Ù…Ø©'
                };
                const catName = categoryTranslations[cat.toLowerCase()] || cat;
                
                menuText += `â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”“\n`;
                menuText += `â”ƒ ${catEmoji} *${catName}*\n`;
                menuText += `â”£â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”«\n`;
                
                const catCmds = CommandHandler.getCommandsByCategory(cat);
                const displayCmds = catCmds.slice(0, 6);
                
                displayCmds.forEach((cmdName, idx) => {
                    const isOff = CommandHandler.disabledCommands.has(cmdName.toLowerCase());
                    const cmdStats = stats.find(s => s.command === cmdName.toLowerCase());
                    const statusIcon = isOff ? disabledEmoji : activeEmoji;
                    let speedTag = '';
                    if (cmdStats && !isOff) {
                        const ms = parseFloat(cmdStats.average_speed);
                        if (ms > 0 && ms < 100) speedTag = ` ${fastEmoji}`;
                        else if (ms > 1000) speedTag = ` ${slowEmoji}`;
                    }
                    menuText += `â”ƒ ${statusIcon} !${cmdName}${speedTag}\n`;
                });
                
                if (catCmds.length > 6) {
                    menuText += `â”ƒ â””â”€ +${catCmds.length - 6} Ø£ÙˆØ§Ù…Ø±\n`;
                }
                menuText += `â”—â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”›\n\n`;
            }
            
            menuText += `â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”“\n`;
            menuText += `â”ƒ ðŸ’¡ *Ø´Ø±Ø­ Ø§Ù„Ø±Ù…ÙˆØ²* ðŸ’¡\n`;
            menuText += `â”£â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”«\n`;
            menuText += `â”ƒ ${activeEmoji} = Ø£Ù…Ø± Ù…ÙØ¹Ù„\n`;
            menuText += `â”ƒ ${disabledEmoji} = Ø£Ù…Ø± Ù…Ø¹Ø·Ù„\n`;
            menuText += `â”ƒ ${fastEmoji} = Ø³Ø±ÙŠØ¹ Ø§Ù„Ø§Ø³ØªØ¬Ø§Ø¨Ø©\n`;
            menuText += `â”ƒ ${slowEmoji} = Ø¨Ø·ÙŠØ¡ Ø§Ù„Ø§Ø³ØªØ¬Ø§Ø¨Ø©\n`;
            menuText += `â”£â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”«\n`;
            menuText += `â”ƒ ðŸ”¥ *ØµÙ†Ø¹ Ø¨ÙˆØ§Ø³Ø·Ø© Crazy Seif* ðŸ”¥\n`;
            menuText += `â”ƒ ðŸ“ž *Ù„Ù„ØªÙˆØ§ØµÙ„:* 01144534147\n`;
            menuText += `â”—â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”›`;
            
            const contextInfo = {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '01144534147@newsletter',
                    newsletterName: 'Crazy Seif',
                    serverMessageId: -1
                }
            };
            
            const messageOptions = thumbnail
                ? { image: thumbnail, caption: menuText, contextInfo }
                : { text: menuText, contextInfo };
            
            await sock.sendMessage(chatId, messageOptions, { quoted: message });
            
        } catch (error) {
            console.error('Ø®Ø·Ø£ ÙÙŠ Ø§Ù„Ù‚Ø§Ø¦Ù…Ø©:', error);
            await sock.sendMessage(chatId, {
                text: `âŒ *Ø®Ø·Ø£ ÙÙŠ Ø§Ù„Ù‚Ø§Ø¦Ù…Ø©*\n\n${error.message}`
            }, { quoted: message });
        }
    }
};

