import axios from 'axios';
export default {
    command: 'بينجويب',
    aliases: ['pweb', 'pingweb'],
    category: 'عام',
    description: 'تحقق بوت زمن الاستجابة اند بينج ا موقع',
    usage: '.بينجويب [موقع رابط]',
    async handler(sock, message, args, context) {
        const { chatId, channelInfo, rawText } = context;
        const prefix = rawText.match(/^[.!#]/)?.[0] || '.';
        const commandPart = rawText.slice(prefix.length).trim();
        const parts = commandPart.split(/\s+/);
        const url = parts.slice(1).join(' ').trim();
        const startBot = Date.now();
        const sent = await sock.sendMessage(chatId, {
            text: 'ðŸ“ Pinging...',
            ...channelInfo
        }, { quoted: message });
        const endBot = Date.now();
        const botLatency = endBot - startBot;
        let responseText = `ðŸ“ *Pong!*\n\nðŸ“¶ *Bot Latency:* ${botLatency}ms`;
        if (url) {
            try {
                let testUrl = url;
                if (!testUrl.startsWith('http://') && !testUrl.startsWith('https://')) {
                    testUrl = `https://${ testUrl}`;
                }
                const urlObj = new URL(testUrl);
                const startWeb = Date.now();
                const response = await axios.get(testUrl, {
                    timeout: 10000,
                    validateStatus: () => true,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });
                const endWeb = Date.now();
                const webLatency = endWeb - startWeb;
                responseText += `\n\nðŸŒ *Website:* ${urlObj.hostname}`;
                responseText += `\nâš¡ *Response Time:* ${webLatency}ms`;
                responseText += `\nðŸ“¡ *Status:* ${response.status} ${response.statusText}`;
                responseText += `\nâœ… *Reachable:* Yes`;
            }
            catch (error) {
                if (error.code === 'ENOTFOUND') {
                    responseText += `\n\nðŸŒ *Website:* ${url}`;
                    responseText += `\nâŒ *Error:* Domain not found`;
                }
                else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
                    responseText += `\n\nðŸŒ *Website:* ${url}`;
                    responseText += `\nâŒ *Error:* Connection timeout`;
                }
                else if (error.message.includes('Invalid URL')) {
                    responseText += `\n\nâŒ *Invalid URL format*`;
                    responseText += `\nðŸ’¡ Example: .ping google.com`;
                }
                else {
                    responseText += `\n\nðŸŒ *Website:* ${url}`;
                    responseText += `\nâŒ *Error:* ${error.message}`;
                }
            }
        }
        else {
            responseText += `\n\nðŸ’¡ *Tip:* Use \`.ping <url>\` to test website response time`;
            responseText += `\nðŸ“ *Example:* .ping google.com`;
        }
        await sock.sendMessage(chatId, {
            text: responseText,
            edit: sent.key,
            ...channelInfo
        });
    }
};




