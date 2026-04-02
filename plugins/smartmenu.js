import config from '../config.js';
import CommandHandler from '../lib/commandHandler.js';
import fs from 'fs';
import path from 'path';

const menuEmojis = ['✨', '🌟', '⭐', '💫', '🎯', '🎨', '🎪', '🎭', '🔥', '💎'];
const activeEmojis = ['✅', '🟢', '💚', '✔️', '☑️'];
const disabledEmojis = ['❌', '🔴', '⛔', '🚫', '❎'];
const fastEmojis = ['⚡', '🚀', '💨', '⏱️', '🔥'];
const slowEmojis = ['🐢', '🐌', '⏳', '⌛', '🕐'];

const categoryEmojis = {
    general: ['📱', '🔧', '⚙️', '🛠️'],
    owner: ['👑', '🔱', '💎', '🎖️'],
    admin: ['🛡️', '⚔️', '🔐', '👮'],
    group: ['👥', '👫', '🧑‍🤝‍🧑', '👨‍👩‍👧‍👦'],
    download: ['📥', '⬇️', '💾', '📦'],
    ai: ['🤖', '🧠', '💭', '🎯'],
    search: ['🔍', '🔎', '🕵️', '📡'],
    apks: ['📲', '📦', '💿', '🗂️'],
    info: ['ℹ️', '📋', '📊', '📄'],
    fun: ['🎮', '🎲', '🎰', '🎪'],
    stalk: ['👀', '🔭', '🕵️', '🎯'],
    games: ['🎮', '🕹️', '🎯', '🏆'],
    images: ['🖼️', '📸', '🎨', '🌄'],
    menu: ['📜', '📋', '📑', '📚'],
    tools: ['🔨', '🔧', '⚡', '🛠️'],
    stickers: ['🎭', '😀', '🎨', '🖼️'],
    quotes: ['💬', '📖', '✍️', '💭'],
    music: ['🎵', '🎶', '🎧', '🎤'],
    utility: ['📂', '🔧', '⚙️', '🛠️']
};

function getRandomEmoji(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getCategoryEmoji(category) {
    const emojis = categoryEmojis[category.toLowerCase()] || ['📂', '📁', '🗂️', '📋'];
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
    command: 'منيو',
    aliases: ['menu', 'smenu', 'shelp', 'smart', 'help2', 'القائمة', 'الاوامر'],
    category: 'general',
    description: 'عرض قائمة الأوامر',
    usage: '!منيو',
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
            
            let menuText = `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n`;
            menuText += `┃ ${menuEmoji} *CRAZY-SEIF BOT* ${menuEmoji}\n`;
            menuText += `┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫\n`;
            menuText += `┃ 🔥 *الاسم:* ${config.botName || 'CRAZY-SEIF'}\n`;
            menuText += `┃ 👤 *المالك:* CRAZY-SEIF\n`;
            menuText += `┃ 📞 *للتواصل:* 201144534147\n`;
            menuText += `┃ ⏰ *الوقت:* ${formatTime()}\n`;
            menuText += `┃ ⚡ *البادئة:* !\n`;
            menuText += `┃ 📊 *الأوامر:* ${CommandHandler.commands.size}\n`;
            menuText += `┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫\n\n`;
            
            const topCmds = stats.slice(0, 3).filter(s => s.usage > 0);
            if (topCmds.length > 0) {
                menuText += `🔥 *الأكثر استخداماً:* 🔥\n`;
                menuText += `┌─────────────────────┐\n`;
                topCmds.forEach((c, i) => {
                    const rank = i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉';
                    menuText += `│ ${rank} !${c.command} • ${c.usage} استخدام\n`;
                });
                menuText += `└─────────────────────┘\n\n`;
            }
            
            for (const cat of categories) {
                const catEmoji = getCategoryEmoji(cat);
                const categoryTranslations = {
                    owner: 'المالك',
                    group: 'المجموعات',
                    admin: 'المشرفين',
                    download: 'التحميل',
                    ai: 'الذكاء الاصطناعي',
                    search: 'البحث',
                    fun: 'التسلية',
                    games: 'الألعاب',
                    tools: 'الأدوات',
                    utility: 'المرافق',
                    general: 'العامة'
                };
                const catName = categoryTranslations[cat.toLowerCase()] || cat;
                
                menuText += `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n`;
                menuText += `┃ ${catEmoji} *${catName}*\n`;
                menuText += `┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫\n`;
                
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
                    menuText += `┃ ${statusIcon} !${cmdName}${speedTag}\n`;
                });
                
                if (catCmds.length > 6) {
                    menuText += `┃ └─ +${catCmds.length - 6} أوامر\n`;
                }
                menuText += `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n`;
            }
            
            menuText += `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n`;
            menuText += `┃ 💡 *شرح الرموز* 💡\n`;
            menuText += `┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫\n`;
            menuText += `┃ ${activeEmoji} = أمر مفعل\n`;
            menuText += `┃ ${disabledEmoji} = أمر معطل\n`;
            menuText += `┃ ${fastEmoji} = سريع الاستجابة\n`;
            menuText += `┃ ${slowEmoji} = بطيء الاستجابة\n`;
            menuText += `┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫\n`;
            menuText += `┃ 🔥 *صنع بواسطة CRAZY-SEIF* 🔥\n`;
            menuText += `┃ 📞 *للتواصل:* 201144534147\n`;
            menuText += `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;
            
            const contextInfo = {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '201144534147@newsletter',
                    newsletterName: 'CRAZY-SEIF',
                    serverMessageId: -1
                }
            };
            
            const messageOptions = thumbnail
                ? { image: thumbnail, caption: menuText, contextInfo }
                : { text: menuText, contextInfo };
            
            await sock.sendMessage(chatId, messageOptions, { quoted: message });
            
        } catch (error) {
            console.error('خطأ في القائمة:', error);
            await sock.sendMessage(chatId, {
                text: `❌ *خطأ في القائمة*\n\n${error.message}`
            }, { quoted: message });
        }
    }
};