import pkg from 'api-qasim';
const QasimAny = pkg;
import axios from 'axios';

export default {
    command: 'ØªØ·Ø¨ÙŠÙ‚',
    aliases: ['apkdl', 'apk', 'an1apk', 'appdl', 'app', 'ØªØ­Ù…ÙŠÙ„_ØªØ·Ø¨ÙŠÙ‚'],
    category: 'Ø§Ù„ØªØ­Ù…ÙŠÙ„',
    description: 'Ø§Ù„Ø¨Ø­Ø« Ø¹Ù† ØªØ·Ø¨ÙŠÙ‚Ø§Øª Ø§Ø¨Ùƒ ÙˆØªØ­Ù…ÙŠÙ„Ù‡Ø§',
    usage: '!ØªØ·Ø¨ÙŠÙ‚ <Ø§Ø³Ù…_Ø§Ù„ØªØ·Ø¨ÙŠÙ‚>',
    
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const query = args.join(' ').trim();
        
        try {
            if (!query) {
                return await sock.sendMessage(chatId, { 
                    text: 'ðŸ“± *ØªØ­Ù…ÙŠÙ„ Ø§Ù„ØªØ·Ø¨ÙŠÙ‚Ø§Øª*\n\n' +
                        '*Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…:* `!ØªØ·Ø¨ÙŠÙ‚ <Ø§Ø³Ù… Ø§Ù„ØªØ·Ø¨ÙŠÙ‚>`\n' +
                        '*Ù…Ø«Ø§Ù„:* `!ØªØ·Ø¨ÙŠÙ‚ ÙˆØ§ØªØ³Ø§Ø¨`' 
                }, { quoted: message });
            }
            
            await sock.sendMessage(chatId, { text: 'ðŸ”Ž Ø¬Ø§Ø±ÙŠ Ø§Ù„Ø¨Ø­Ø« Ø¹Ù† Ø§Ù„ØªØ·Ø¨ÙŠÙ‚Ø§Øª...' }, { quoted: message });
            
            const res = await QasimAny.apksearch(query);
            
            if (!res?.data || !Array.isArray(res.data) || res.data.length === 0) {
                return await sock.sendMessage(chatId, { 
                    text: 'âŒ Ù„Ø§ ØªÙˆØ¬Ø¯ ØªØ·Ø¨ÙŠÙ‚Ø§Øª Ù…Ø·Ø§Ø¨Ù‚Ø© Ù„Ù„Ø¨Ø­Ø«.' 
                }, { quoted: message });
            }
            
            const results = res.data;
            const first = results[0];
            
            let caption = `ðŸ“± *Ù†ØªØ§Ø¦Ø¬ Ø§Ù„Ø¨Ø­Ø« Ø¹Ù†:* *${query}*\n\n`;
            caption += `â†©ï¸ *Ø±Ø¯ Ø¨Ø±Ù‚Ù… Ø§Ù„ØªØ·Ø¨ÙŠÙ‚ Ø§Ù„Ø°ÙŠ ØªØ±ÙŠØ¯ ØªØ­Ù…ÙŠÙ„Ù‡*\n\n`;
            
            results.forEach((item, i) => {
                caption +=
                    `*${i + 1}.* ${item.judul}\n` +
                    `ðŸ‘¨â€ðŸ’» Ø§Ù„Ù…Ø·ÙˆØ±: ${item.dev}\n` +
                    `â­ Ø§Ù„ØªÙ‚ÙŠÙŠÙ…: ${item.rating}\n` +
                    `ðŸ”— Ø§Ù„Ø±Ø§Ø¨Ø·: ${item.link}\n\n`;
            });
            
            const sentMsg = await sock.sendMessage(chatId, { 
                image: { url: first.thumb }, 
                caption 
            }, { quoted: message });
            
            const timeout = setTimeout(async () => {
                sock.ev.off('messages.upsert', listener);
                await sock.sendMessage(chatId, { 
                    text: 'â± Ø§Ù†ØªÙ‡Ù‰ ÙˆÙ‚Øª Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„ØªØ·Ø¨ÙŠÙ‚. ÙŠØ±Ø¬Ù‰ Ø§Ù„Ø¨Ø­Ø« Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.' 
                }, { quoted: sentMsg });
            }, 5 * 60 * 1000);
            
            const listener = async ({ messages }) => {
                const m = messages[0];
                if (!m?.message || m.key.remoteJid !== chatId) return;
                
                const ctx = m.message?.extendedTextMessage?.contextInfo;
                if (!ctx?.stanzaId || ctx.stanzaId !== sentMsg.key.id) return;
                
                const replyText = m.message.conversation ||
                    m.message.extendedTextMessage?.text ||
                    '';
                const choice = parseInt(replyText.trim(), 10);
                
                if (isNaN(choice) || choice < 1 || choice > results.length) {
                    return await sock.sendMessage(chatId, { 
                        text: `âŒ Ø§Ø®ØªÙŠØ§Ø± ØºÙŠØ± ØµØ­ÙŠØ­. Ø§Ø®ØªØ± Ø±Ù‚Ù… Ù…Ù† 1 Ø¥Ù„Ù‰ ${results.length}.` 
                    }, { quoted: m });
                }
                
                clearTimeout(timeout);
                sock.ev.off('messages.upsert', listener);
                
                const selected = results[choice - 1];
                
                await sock.sendMessage(chatId, { 
                    text: `â¬‡ï¸ Ø¬Ø§Ø±ÙŠ ØªØ­Ù…ÙŠÙ„ *${selected.judul}*...\nâ± ÙŠØ±Ø¬Ù‰ Ø§Ù„Ø§Ù†ØªØ¸Ø§Ø±...` 
                }, { quoted: m });
                
                const apiUrl = `https://discardapi.dpdns.org/api/apk/dl/android1?apikey=guru&url=${encodeURIComponent(selected.link)}`;
                const dlRes = await axios.get(apiUrl);
                const apk = dlRes.data?.result;
                
                if (!apk?.url) {
                    return await sock.sendMessage(chatId, { 
                        text: 'âŒ ÙØ´Ù„ Ø§Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ø±Ø§Ø¨Ø· ØªØ­Ù…ÙŠÙ„ Ø§Ù„ØªØ·Ø¨ÙŠÙ‚.' 
                    }, { quoted: m });
                }
                
                const safeName = apk.name.replace(/[^\w.-]/g, '_');
                const apkCaption = `ðŸ“¦ *ØªÙ… ØªØ­Ù…ÙŠÙ„ Ø§Ù„ØªØ·Ø¨ÙŠÙ‚*\n\n` +
                    `ðŸ“› Ø§Ù„Ø§Ø³Ù…: ${apk.name}\n` +
                    `â­ Ø§Ù„ØªÙ‚ÙŠÙŠÙ…: ${apk.rating}\n` +
                    `ðŸ“¦ Ø§Ù„Ø­Ø¬Ù…: ${apk.size}\n` +
                    `ðŸ“± Ø§Ù„Ø£Ù†Ø¯Ø±ÙˆÙŠØ¯: ${apk.requirement}\n` +
                    `ðŸ§’ Ø§Ù„ÙØ¦Ø© Ø§Ù„Ø¹Ù…Ø±ÙŠØ©: ${apk.rated}\n` +
                    `ðŸ“… ØªØ§Ø±ÙŠØ® Ø§Ù„Ù†Ø´Ø±: ${apk.published}\n\n` +
                    `ðŸ“ Ø§Ù„ÙˆØµÙ:\n${apk.description}`;
                
                await sock.sendMessage(chatId, { 
                    document: { url: apk.url }, 
                    fileName: `${safeName}.apk`, 
                    mimetype: 'application/vnd.android.package-archive', 
                    caption: apkCaption 
                }, { quoted: m });
            };
            
            sock.ev.on('messages.upsert', listener);
            
        } catch (err) {
            console.error('âŒ Ø®Ø·Ø£ ÙÙŠ Ø£Ù…Ø± ØªØ­Ù…ÙŠÙ„ Ø§Ù„ØªØ·Ø¨ÙŠÙ‚Ø§Øª:', err);
            await sock.sendMessage(chatId, { 
                text: 'âŒ ÙØ´Ù„ ÙÙŠ Ù…Ø¹Ø§Ù„Ø¬Ø© Ø·Ù„Ø¨ ØªØ­Ù…ÙŠÙ„ Ø§Ù„ØªØ·Ø¨ÙŠÙ‚.' 
            }, { quoted: message });
        }
    }
};

