export default {
    command: '8بالل',
    aliases: ['eightball', 'magic8ball', '8ball'],
    category: 'تسلية',
    description: '',
    usage: '.8بالل ويلل ي بي ريكه?',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        try {
            const question = args.join(' ');
            if (!question) {
                await sock.sendMessage(chatId, {
                    text: 'ðŸŽ± Please ask a question!'
                }, { quoted: message });
                return;
            }
            const eightBallResponses = [
                "Yes, definitely!",
                "No way!",
                "Ask again later.",
                "It is certain.",
                "Very doubtful.",
                "Without a doubt.",
                "My reply is no.",
                "Signs point to yes."
            ];
            const randomResponse = eightBallResponses[Math.floor(Math.random() * eightBallResponses.length)];
            await sock.sendMessage(chatId, {
                text: `ðŸŽ± *Question:* ${question}\n\n*Answer:* ${randomResponse}`
            }, { quoted: message });
        }
        catch (error) {
            console.error('Error in 8ball command:', error);
            await sock.sendMessage(chatId, {
                text: 'âŒ Something went wrong with the magic 8-ball!'
            }, { quoted: message });
        }
    }
};



