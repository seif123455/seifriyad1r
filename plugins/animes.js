import axios from 'axios';

const supportedAnimes = [
    'akira', 'akiyama', 'anna', 'asuna', 'ayuzawa', 'boruto', 'chiho', 'chitoge',
    'deidara', 'erza', 'elaina', 'eba', 'emilia', 'hestia', 'hinata', 'inori',
    'isuzu', 'itachi', 'itori', 'kaga', 'kagura', 'kaori', 'keneki', 'kotori',
    'kurumi', 'madara', 'mikasa', 'miku', 'minato', 'naruto', 'nezuko', 'sagiri',
    'sasuke', 'sakura'
];

function pickRandom(arr, count = 1) {
    const shuffled = arr.slice().sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

const animuMenu = 'ðŸŽ€ *Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ø£Ù†Ù…ÙŠ* ðŸŽ€\n\n' +
    'â€¢ *akira*\n' +
    'â€¢ *akiyama*\n' +
    'â€¢ *anna*\n' +
    'â€¢ *asuna*\n' +
    'â€¢ *ayuzawa*\n' +
    'â€¢ *boruto*\n' +
    'â€¢ *chiho*\n' +
    'â€¢ *chitoge*\n' +
    'â€¢ *deidara*\n' +
    'â€¢ *erza*\n' +
    'â€¢ *elaina*\n' +
    'â€¢ *eba*\n' +
    'â€¢ *emilia*\n' +
    'â€¢ *hestia*\n' +
    'â€¢ *hinata*\n' +
    'â€¢ *inori*\n' +
    'â€¢ *isuzu*\n' +
    'â€¢ *itachi*\n' +
    'â€¢ *itori*\n' +
    'â€¢ *kaga*\n' +
    'â€¢ *kagura*\n' +
    'â€¢ *kaori*\n' +
    'â€¢ *keneki*\n' +
    'â€¢ *kotori*\n' +
    'â€¢ *kurumi*\n' +
    'â€¢ *madara*\n' +
    'â€¢ *mikasa*\n' +
    'â€¢ *miku*\n' +
    'â€¢ *minato*\n' +
    'â€¢ *naruto*\n' +
    'â€¢ *nezuko*\n' +
    'â€¢ *sagiri*\n' +
    'â€¢ *sasuke*\n' +
    'â€¢ *sakura*\n\n' +
    'ðŸ“Œ *Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…:*\n' +
    '!Ø§Ù†Ù…ÙŠ <Ø§Ø³Ù… Ø§Ù„Ø£Ù†Ù…ÙŠ>\n' +
    '*Ù…Ø«Ø§Ù„:* `!Ø§Ù†Ù…ÙŠ Ù†Ø§Ø±ÙˆØªÙˆ` Ø£Ùˆ `!Ø§Ù†Ù…ÙŠ naruto`';

export default {
    command: 'Ø§Ù†Ù…ÙŠ',
    aliases: ['animes', 'animeimg', 'animepic', 'ØµÙˆØ±_Ø§Ù†Ù…ÙŠ'],
    category: 'ØªØ³Ù„ÙŠØ©',
    description: 'Ø¥Ø±Ø³Ø§Ù„ ØµÙˆØ± Ø£Ù†Ù…ÙŠ Ø¹Ø´ÙˆØ§Ø¦ÙŠØ©',
    usage: '!Ø§Ù†Ù…ÙŠ <Ø§Ø³Ù…_Ø§Ù„Ø£Ù†Ù…ÙŠ>',
    
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const input = args[0] ? args[0] : '';
        const typeLower = input.toLowerCase();
        
        if (!input || !supportedAnimes.includes(typeLower)) {
            const replyText = input && !supportedAnimes.includes(typeLower)
                ? `âŒ Ø£Ù†Ù…ÙŠ ØºÙŠØ± Ù…Ø¯Ø¹ÙˆÙ…: ${typeLower}\n\n`
                : '';
            return await sock.sendMessage(chatId, { text: replyText + animuMenu }, { quoted: message });
        }
        
        try {
            const apiUrl = `https://raw.githubusercontent.com/Guru322/api/Guru/BOT-JSON/anime-${typeLower}.json`;
            const res = await axios.get(apiUrl, { timeout: 15000, validateStatus: s => s < 500 });
            const images = res.data;
            
            if (!Array.isArray(images) || images.length === 0)
                throw new Error('Ù„Ø§ ØªÙˆØ¬Ø¯ ØµÙˆØ±');
            
            const randomImages = pickRandom(images, Math.min(3, images.length));
            
            for (const img of randomImages) {
                try {
                    const imageData = await axios.get(img, { responseType: 'arraybuffer', timeout: 15000 });
                    await sock.sendMessage(chatId, { 
                        image: Buffer.from(imageData.data), 
                        caption: `âœ¨ *${typeLower}*\nðŸ”¥ Crazy Seif` 
                    }, { quoted: message });
                } catch { }
            }
            
        } catch (err) {
            await sock.sendMessage(chatId, { 
                text: 'âŒ ÙØ´Ù„ ÙÙŠ Ø¬Ù„Ø¨ ØµÙˆØ± Ø§Ù„Ø£Ù†Ù…ÙŠ. ÙŠØ±Ø¬Ù‰ Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø© Ù…Ø±Ø© Ø£Ø®Ø±Ù‰ Ù„Ø§Ø­Ù‚Ø§Ù‹.' 
            }, { quoted: message });
        }
    }
};

