export default {
    command: 'فليرت',
    aliases: ['flirty', 'pickuplines', 'flirt'],
    category: 'تسلية',
    description: 'جلب ا عشوائي فليرت رسالة',
    usage: '.فليرت',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        try {
            const shizokeys = 'shizo';
            const res = await fetch(`https://shizoapi.onrender.com/api/texts/flirt?apikey=${shizokeys}`);
            if (!res.ok)
                throw await res.text();
            const r = await res.json();
            await sock.sendMessage(chatId, { text: r.result }, { quoted: message });
        }
        catch (e) {
            console.error('Error in flirt command:', e);
            await sock.sendMessage(chatId, { text: 'âŒ Failed to get flirt message. Please try again later!' }, { quoted: message });
        }
    }
};



