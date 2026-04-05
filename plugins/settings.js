import isOwnerOrSudo, { cleanJid } from '../lib/isOwner.js';
import { getChatbot, getWelcome, getGoodbye, getAntitag } from '../lib/index.js';
import store from '../lib/lightweight_store.js';
export default {
    command: 'إعدادات',
    aliases: ['config', 'setting', 'settings'],
    category: 'المالك',
    description: 'عرض بوت إعدادات اند بير-مجموعة كونفيجوراتيونس',
    usage: '.إعدادات',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const senderId = message.key.participant || message.key.remoteJid;
        try {
            const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
            const isMe = message.key.fromMe;
            if (!isMe && !isOwner) {
                return await sock.sendMessage(chatId, {
                    text: 'âŒ *Access Denied:* Only Owner/Sudo can view settings.'
                }, { quoted: message });
            }
            const isGroup = chatId.endsWith('@g.us');
            const botMode = await store.getBotMode();
            const autoStatus = await store.getSetting('global', 'autoStatus') || { enabled: false };
            const autoread = await store.getSetting('global', 'autoread') || { enabled: false };
            const autotyping = await store.getSetting('global', 'autotyping') || { enabled: false };
            const pmblocker = await store.getSetting('global', 'pmblocker') || { enabled: false };
            const anticall = await store.getSetting('global', 'anticall') || { enabled: false };
            const autoReactionData = await store.getSetting('global', 'autoReaction');
            const mentionData = await store.getSetting('global', 'mention');
            const autoReaction = autoReactionData?.enabled || false;
            const stealthMode = await store.getSetting('global', 'stealthMode') || { enabled: false };
            const autoBio = await store.getSetting('global', 'autoBio') || { enabled: false };
            // cmdreact saves to userGroupData.json as data.autoReaction
            const fs = (await import('fs')).default;
            let cmdReactEnabled = true;
            try {
                const ugd = JSON.parse(fs.readFileSync('./data/userGroupData.json', 'utf-8'));
                cmdReactEnabled = ugd.autoReaction ?? true;
            }
            catch {
                cmdReactEnabled = true;
            }
            const getSt = (val) => val ? 'âœ…' : 'âŒ';
            let menuText = `â•­â”ã€” *MEGA CONFIG* ã€•â”â”ˆ\nâ”ƒ\n`;
            menuText += `â”ƒ ðŸ‘¤ *User:* @${cleanJid(senderId)}\n`;
            menuText += `â”ƒ ðŸ¤– *Mode:* ${botMode.toUpperCase()}\n`;
            menuText += `â”ƒ\nâ”£â”ã€” *GLOBAL CONFIG* ã€•â”â”ˆ\n`;
            menuText += `â”ƒ ${getSt(autoStatus?.enabled)} *Auto Status*\n`;
            menuText += `â”ƒ ${getSt(autoread?.enabled)} *Auto Read*\n`;
            menuText += `â”ƒ ${getSt(autotyping?.enabled)} *Auto Typing*\n`;
            menuText += `â”ƒ ${getSt(pmblocker?.enabled)} *PM Blocker*\n`;
            menuText += `â”ƒ ${getSt(anticall?.enabled)} *Anti Call*\n`;
            menuText += `â”ƒ ${getSt(autoReaction)} *Auto Reaction*\n`;
            menuText += `â”ƒ ${getSt(cmdReactEnabled)} *Cmd Reactions*\n`;
            menuText += `â”ƒ ${getSt(stealthMode?.enabled)} *Stealth Mode*\n`;
            menuText += `â”ƒ ${getSt(autoBio?.enabled)} *Auto Bio*\n`;
            menuText += `â”ƒ ${getSt(mentionData?.enabled)} *Mention Alert*\n`;
            menuText += `â”ƒ\n`;
            if (isGroup) {
                const groupSettings = await store.getAllSettings(chatId);
                const groupAntilink = groupSettings.antilink || { enabled: false };
                const groupBadword = groupSettings.antibadword || { enabled: false };
                const antitag = await getAntitag(chatId, 'on');
                const groupAntitag = { enabled: !!antitag };
                const chatbotData = await getChatbot(chatId);
                const welcomeData = await getWelcome(chatId);
                const goodbyeData = await getGoodbye(chatId);
                // getChatbot returns true/false or {enabled}
                const groupChatbot = chatbotData === true || chatbotData?.enabled || false;
                // getWelcome returns null or message string or {enabled}
                const groupWelcome = welcomeData !== null && welcomeData !== undefined && welcomeData !== false;
                // getGoodbye returns null or message string or {enabled}
                const groupGoodbye = goodbyeData !== null && goodbyeData !== undefined && goodbyeData !== false;
                menuText += `â”£â”ã€” *GROUP CONFIG* ã€•â”â”ˆ\n`;
                menuText += `â”ƒ ${getSt(groupAntilink.enabled)} *Antilink*\n`;
                menuText += `â”ƒ ${getSt(groupBadword.enabled)} *Antibadword*\n`;
                menuText += `â”ƒ ${getSt(groupAntitag.enabled)} *Antitag*\n`;
                menuText += `â”ƒ ${getSt(groupChatbot)} *Chatbot*\n`;
                menuText += `â”ƒ ${getSt(groupWelcome)} *Welcome*\n`;
                menuText += `â”ƒ ${getSt(groupGoodbye)} *Goodbye*\n`;
            }
            else {
                menuText += `â”ƒ ðŸ’¡ *Note:* _Use in group for group configs._\n`;
            }
            menuText += `â”ƒ\nâ•°â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”ˆ`;
            await sock.sendMessage(chatId, {
                text: menuText,
                mentions: [senderId],
                contextInfo: {
                    externalAdReply: {
                        title: "SYSTEM SETTINGS PANEL",
                        body: "Configuration Status",
                        thumbnailUrl: "https://github.com/CrazySeif.png",
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: message });
        }
        catch (error) {
            console.error('Settings Command Error:', error);
            await sock.sendMessage(chatId, {
                text: 'âŒ Error: Failed to load settings.'
            }, { quoted: message });
        }
    }
};




