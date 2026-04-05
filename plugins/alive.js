/*****************************************************************************
 *                                                                           *
 *                     Developed By Crazy Seif                               *
 *                                                                           *
 *  ðŸ“ž  WhatsApp : 01144534147                                              *
 *                                                                           *
 *    Â© 2026 Crazy Seif. All rights reserved.                               *
 *                                                                           *
 *****************************************************************************/
import os from 'os';
import process from 'process';

export default {
    command: 'Ø­Ø§Ù„Ø©',
    aliases: ['alive', 'status', 'bot', 'Ø±ÙˆÙ†', 'ØªØ´ØºÙŠÙ„'],
    category: 'Ø¹Ø§Ù…',
    description: 'Ø¹Ø±Ø¶ Ø­Ø§Ù„Ø© Ø§Ù„Ø¨ÙˆØª ÙˆÙ…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„Ù†Ø¸Ø§Ù…',
    usage: '!Ø­Ø§Ù„Ø©',
    isPrefixless: false,
    
    async handler(sock, message, args, context) {
        const { chatId, config } = context;
        
        try {
            let uptime = Math.floor(process.uptime());
            const days = Math.floor(uptime / 86400);
            uptime %= 86400;
            const hours = Math.floor(uptime / 3600);
            uptime %= 3600;
            const minutes = Math.floor(uptime / 60);
            const seconds = (Number(uptime) % Number(60));
            
            const uptimeParts = [];
            if (days) uptimeParts.push(`${days} ÙŠÙˆÙ…`);
            if (hours) uptimeParts.push(`${hours} Ø³Ø§Ø¹Ø©`);
            if (minutes) uptimeParts.push(`${minutes} Ø¯Ù‚ÙŠÙ‚Ø©`);
            if (seconds || uptimeParts.length === 0) uptimeParts.push(`${seconds} Ø«Ø§Ù†ÙŠØ©`);
            
            const uptimeText = uptimeParts.join(' ');
            
            const totalMem = (os.totalmem() / 1024 / 1024).toFixed(2);
            const freeMem = (os.freemem() / 1024 / 1024).toFixed(2);
            const usedMem = (Number(totalMem) - Number(freeMem)).toFixed(2);
            const cpuLoad = os.loadavg()[0].toFixed(2);
            const platform = os.platform();
            const arch = os.arch();
            const nodeVersion = process.version;
            
            const text = 
                `â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”“\n` +
                `â”ƒ ðŸ¤– *${config.botName || 'Crazy Seif'} Ø´ØºØ§Ù„!* \n` +
                `â”£â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”«\n` +
                `â”ƒ â° *Ù…Ø¯Ø© Ø§Ù„ØªØ´ØºÙŠÙ„:* ${uptimeText}\n` +
                `â”ƒ ðŸ’¾ *Ø§Ù„Ø°Ø§ÙƒØ±Ø©:* ${usedMem} MB / ${totalMem} MB\n` +
                `â”ƒ ðŸ”¥ *ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ù…Ø¹Ø§Ù„Ø¬:* ${cpuLoad}\n` +
                `â”ƒ ðŸ’» *Ø§Ù„Ù†Ø¸Ø§Ù…:* ${platform} (${arch})\n` +
                `â”ƒ ðŸ“¦ *Node.js:* ${nodeVersion}\n` +
                `â”£â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”«\n` +
                `â”ƒ ðŸ”¥ *Crazy Seif*\n` +
                `â”ƒ ðŸ“ž *Ù„Ù„ØªÙˆØ§ØµÙ„:* 01144534147\n` +
                `â”—â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”›`;
            
            await sock.sendMessage(chatId, {
                text,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '01144534147@newsletter',
                        newsletterName: 'Crazy Seif',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
            
        } catch (error) {
            console.error('Ø®Ø·Ø£ ÙÙŠ Ø£Ù…Ø± Ø§Ù„Ø­Ø§Ù„Ø©:', error);
            await sock.sendMessage(chatId, { 
                text: 'âœ… Ø§Ù„Ø¨ÙˆØª Ø´ØºØ§Ù„ ÙˆØ¨Ø®ÙŠØ±! ðŸ”¥' 
            }, { quoted: message });
        }
    }
};

