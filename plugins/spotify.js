import axios from 'axios';
const API = 'https://api.qasimdev.dpdns.org/api/spotify/download';
const API_KEY = 'qasim-dev';
const formatDuration = (ms) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m}:${s.toString().padStart(2, '0')}`;
};
export default {
    command: 'سبوتيفي',
    aliases: ['sptfdl', 'spotifydl', 'spotify'],
    category: 'التحميل',
    description: 'تحميل موسيقى فروم سبوتيفي',
    usage: '.سبوتيفي <سبوتيفي-رابط>',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const url = args.join(' ').trim();
        if (!url || !url.includes('spotify.com')) {
            return sock.sendMessage(chatId, {
                text: 'ðŸŽµ *Spotify Downloader*\n\nUsage: `.spotify <spotify track url>`\nExample: `.spotify https://open.spotify.com/track/4LMlVCXHJtCE9abhmn0mYo`'
            }, { quoted: message });
        }
        try {
            await sock.sendMessage(chatId, { react: { text: 'ðŸŽµ', key: message.key } });
            const { data } = await axios.get(API, {
                params: { apiKey: API_KEY, url },
                timeout: 30000
            });
            if (!data?.success || !data?.data) {
                throw new Error('Invalid API response');
            }
            const track = data.data;
            if (!track.download) {
                return sock.sendMessage(chatId, {
                    text: 'âŒ No downloadable audio found for this track.'
                }, { quoted: message });
            }
            const caption = [
                `ðŸŽµ *${track.title || 'Unknown Title'}*`,
                track.artist ? `ðŸ‘¤ ${track.artist}` : '',
                track.duration ? `â± ${formatDuration(track.duration)}` : '',
                track.format ? `ðŸŽ§ Format: ${track.format.toUpperCase()}` : ''
            ].filter(Boolean).join('\n');
            if (track.cover) {
                await sock.sendMessage(chatId, {
                    image: { url: track.cover },
                    caption
                }, { quoted: message });
            }
            else if (caption) {
                await sock.sendMessage(chatId, { text: caption }, { quoted: message });
            }
            await sock.sendMessage(chatId, {
                audio: { url: track.download },
                mimetype: 'audio/mpeg',
                fileName: `${(track.title || 'track').replace(/[\\/:*?"<>|]/g, '')}.mp3`
            }, { quoted: message });
        }
        catch (error) {
            console.error('[SPOTIFY] error:', error.message);
            await sock.sendMessage(chatId, {
                text: 'âŒ Failed to download track. Please check the URL and try again.'
            }, { quoted: message });
        }
    }
};




