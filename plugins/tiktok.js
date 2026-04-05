import axios from 'axios';
export default {
    command: 'تيكتوك',
    aliases: ['tt', 'ttdl', 'tiktokdl', 'tiktok'],
    category: 'التحميل',
    description: 'تحميل تيكتوك فيديو بدون علامة مائية (هد يف افايلابلي)',
    usage: '.تيكتوك <تيكتوك رابط>',
    async handler(sock, message, args, context) {
        const { chatId, rawText } = context;
        const prefix = rawText.match(/^[.!#]/)?.[0] || '.';
        const commandPart = rawText.slice(prefix.length).trim();
        const parts = commandPart.split(/\s+/);
        const url = parts.slice(1).join(' ').trim();
        if (!url) {
            return await sock.sendMessage(chatId, {
                text: 'ðŸŽµ *TikTok Downloader*\n\nPlease provide a TikTok URL.\nExample:\n.tiktok https://vm.tiktok.com/XXXX'
            }, { quoted: message });
        }
        try {
            await sock.sendMessage(chatId, {
                text: 'â³ Downloading TikTok video...'
            }, { quoted: message });
            const apiUrl = `https://discardapi.onrender.com/api/dl/tiktok?apikey=guru&url=${encodeURIComponent(url)}`;
            const { data } = await axios.get(apiUrl, {
                timeout: 45000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            if (!data?.status || !data?.result) {
                throw new Error('Invalid API response');
            }
            const res = data.result;
            const hd = res.data.find((v) => v.type === 'nowatermark_hd');
            const noWm = res.data.find((v) => v.type === 'nowatermark');
            const videoUrl = hd?.url || noWm?.url;
            if (!videoUrl) {
                throw new Error('No downloadable video found');
            }
            const caption = `ðŸŽµ *TikTok Downloader*
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
ðŸ‘¤ *User:* ${res.author.nickname}
ðŸ†” *Username:* ${res.author.fullname}
ðŸŒ *Region:* ${res.region}
â±ï¸ *Duration:* ${res.duration}

â¤ï¸ *Likes:* ${res.stats.likes}
ðŸ’¬ *Comments:* ${res.stats.comment}
ðŸ” *Shares:* ${res.stats.share}
ðŸ‘€ *Views:* ${res.stats.views}

ðŸŽ§ *Sound:* ${res.music_info.title}
ðŸ“… *Posted:* ${res.taken_at}

ðŸ“ *Caption:*
${res.title || 'No caption'}

âœ¨ *Quality:* ${hd ? 'HD No Watermark' : 'No Watermark'}
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”`;
            await sock.sendMessage(chatId, {
                video: { url: videoUrl },
                mimetype: 'video/mp4',
                caption
            }, { quoted: message });
        }
        catch (error) {
            console.error('TikTok plugin error:', error);
            if (error.code === 'ECONNABORTED') {
                await sock.sendMessage(chatId, {
                    text: 'â±ï¸ Request timed out. Please try again later.'
                }, { quoted: message });
            }
            else {
                await sock.sendMessage(chatId, {
                    text: `âŒ Failed to download TikTok video.\nReason: ${error.message}`
                }, { quoted: message });
            }
        }
    }
};




