import axios from 'axios';
import yts from 'yt-search';

const DL_API = 'https://api.qasimdev.dpdns.org/api/loaderto/download';
const API_KEY = 'xbps-install-Syu';
const wait = (ms) => new Promise(r => setTimeout(r, ms));

const downloadWithRetry = async (url, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            const { data } = await axios.get(DL_API, {
                params: { apiKey: API_KEY, format: '360', url },
                timeout: 90000
            });
            if (data?.data?.downloadUrl) return data.data;
            throw new Error('Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ø±Ø§Ø¨Ø· ØªØ­Ù…ÙŠÙ„');
        } catch (err) {
            if (i === retries - 1) throw err;
            console.log(`Ù…Ø­Ø§ÙˆÙ„Ø© Ø§Ù„ØªØ­Ù…ÙŠÙ„ ${i + 1} ÙØ´Ù„ØªØŒ Ø¥Ø¹Ø§Ø¯Ø© Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø© Ø¨Ø¹Ø¯ 5 Ø«ÙˆØ§Ù†Ù...`);
            await wait(5000);
        }
    }
    throw new Error('Ø¬Ù…ÙŠØ¹ Ù…Ø­Ø§ÙˆÙ„Ø§Øª Ø§Ù„ØªØ­Ù…ÙŠÙ„ ÙØ´Ù„Øª');
};

export default {
    command: 'ÙÙŠØ¯ÙŠÙˆ',
    aliases: ['video', 'ytmp4', 'ytvideo', 'ytdl', 'ØªØ­Ù…ÙŠÙ„_ÙÙŠØ¯ÙŠÙˆ_ÙŠÙˆØªÙŠÙˆØ¨'],
    category: 'Ø§Ù„ØªØ­Ù…ÙŠÙ„',
    description: 'ØªØ­Ù…ÙŠÙ„ ÙÙŠØ¯ÙŠÙˆÙ‡Ø§Øª Ù…Ù† ÙŠÙˆØªÙŠÙˆØ¨ Ø¨Ø§Ù„Ø±Ø§Ø¨Ø· Ø£Ùˆ Ø§Ù„Ø¨Ø­Ø«',
    usage: '!ÙÙŠØ¯ÙŠÙˆ <Ø±Ø§Ø¨Ø· ÙŠÙˆØªÙŠÙˆØ¨ | Ù†Øµ Ø§Ù„Ø¨Ø­Ø«>',
    
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const query = args.join(' ').trim();
        
        if (!query) {
            return sock.sendMessage(chatId, { 
                text: 'ðŸŽ¥ *ØªØ­Ù…ÙŠÙ„ ÙÙŠØ¯ÙŠÙˆ Ù…Ù† ÙŠÙˆØªÙŠÙˆØ¨*\n\n' +
                    '*Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…:* `!ÙÙŠØ¯ÙŠÙˆ <Ø§Ù„Ø±Ø§Ø¨Ø· Ø£Ùˆ Ù†Øµ Ø§Ù„Ø¨Ø­Ø«>`\n' +
                    '*Ù…Ø«Ø§Ù„:* `!ÙÙŠØ¯ÙŠÙˆ Alan Walker Faded`\n' +
                    '*Ù…Ø«Ø§Ù„:* `!ÙÙŠØ¯ÙŠÙˆ https://youtu.be/...`' 
            }, { quoted: message });
        }
        
        try {
            let videoUrl;
            let videoTitle;
            let videoThumbnail;
            
            if (query.startsWith('http://') || query.startsWith('https://')) {
                videoUrl = query;
            } else {
                const { videos } = await yts(query);
                if (!videos?.length) return sock.sendMessage(chatId, { 
                    text: 'âŒ Ù„Ø§ ØªÙˆØ¬Ø¯ ÙÙŠØ¯ÙŠÙˆÙ‡Ø§Øª Ù…Ø·Ø§Ø¨Ù‚Ø© Ù„Ù„Ø¨Ø­Ø«!' 
                }, { quoted: message });
                
                videoUrl = videos[0].url;
                videoTitle = videos[0].title;
                videoThumbnail = videos[0].thumbnail;
            }
            
            const validYT = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([a-zA-Z0-9_-]{11})/);
            if (!validYT) return sock.sendMessage(chatId, { 
                text: 'âŒ Ø±Ø§Ø¨Ø· ÙŠÙˆØªÙŠÙˆØ¨ ØºÙŠØ± ØµØ§Ù„Ø­!' 
            }, { quoted: message });
            
            const ytId = validYT[1];
            const thumb = videoThumbnail || `https://i.ytimg.com/vi/${ytId}/sddefault.jpg`;
            
            await sock.sendMessage(chatId, {
                image: { url: thumb },
                caption: `ðŸŽ¬ *${videoTitle || query}*\nâ¬‡ï¸ Ø¬Ø§Ø±ÙŠ Ø§Ù„ØªØ­Ù…ÙŠÙ„... *(Ù‚Ø¯ ÙŠØ³ØªØºØ±Ù‚ Ø­ØªÙ‰ 30 Ø«Ø§Ù†ÙŠØ©)*`
            }, { quoted: message });
            
            const videoData = await downloadWithRetry(videoUrl);
            
            await sock.sendMessage(chatId, {
                video: { url: videoData.downloadUrl },
                mimetype: 'video/mp4',
                fileName: `${(videoData.title || videoTitle || 'video').replace(/[^\w\u0600-\u06FF\s]/g, '')}.mp4`,
                caption: `ðŸŽ¬ *${videoData.title || videoTitle || 'ÙÙŠØ¯ÙŠÙˆ'}*\n\n> ðŸ”¥ *Crazy Seif BOT* | ðŸ“ž 01144534147`
            }, { quoted: message });
            
        } catch (err) {
            console.error('[ÙÙŠØ¯ÙŠÙˆ] Ø®Ø·Ø£:', err.message);
            
            const reason = err.response?.status === 408
                ? 'Ø§Ù†ØªÙ‡Øª Ù…Ù‡Ù„Ø© Ø§Ù„ØªØ­Ù…ÙŠÙ„. Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.'
                : err.message;
                
            await sock.sendMessage(chatId, { 
                text: `âŒ ÙØ´Ù„ Ø§Ù„ØªØ­Ù…ÙŠÙ„!\nØ§Ù„Ø³Ø¨Ø¨: ${reason}` 
            }, { quoted: message });
        }
    }
};

