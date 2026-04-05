export default {
    command: 'ميمي',
    aliases: ['cheems', 'memes', 'meme'],
    category: 'تسلية',
    description: 'جلب ا عشوائي كهييمس ميمي ويته بوتتونس فور انوتهير ميمي ور جوكي',
    usage: '.ميمي',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        try {
            const res = await fetch('https://shizoapi.onrender.com/api/memes/cheems?apikey=shizo');
            if (!res.ok)
                throw new Error(`API request failed with status ${res.status}`);
            const contentType = res.headers.get('content-type');
            if (contentType && contentType.includes('image')) {
                const imageBuffer = Buffer.from(await res.arrayBuffer());
                const buttons = [
                    { buttonId: '.ميمي', buttonText: { displayText: 'ðŸŽ­ Another Meme' }, type: 1 },
                    { buttonId: '.joke', buttonText: { displayText: 'ðŸ˜„ Joke' }, type: 1 }
                ];
                await sock.sendMessage(chatId, {
                    image: imageBuffer,
                    caption: "ðŸ• > Here's your cheems meme!",
                    buttons,
                    headerType: 1
                }, { quoted: message });
            }
            else {
                await sock.sendMessage(chatId, {
                    text: 'âŒ The API did not return a valid image.',
                    quoted: message
                });
            }
        }
        catch (error) {
            console.error('Meme Command Error:', error);
            await sock.sendMessage(chatId, {
                text: 'âŒ Failed to fetch meme. Please try again later.',
                quoted: message
            });
        }
    }
};



