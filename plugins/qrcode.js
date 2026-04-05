import QRCode from 'qrcode';
export default {
    command: 'قركودي',
    aliases: ['qr', 'qrcode'],
    category: 'أدوات',
    description: 'توليد ا رمز قر فروم نص',
    usage: '.قركود <نص>',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const text = args?.join(' ')?.trim();
        if (!text) {
            return await sock.sendMessage(chatId, { text: '*Provide text to generate QR*\nExample: .qrcode Hello World' }, { quoted: message });
        }
        try {
            const qr = await QRCode.toDataURL(text.slice(0, 2048), {
                errorCorrectionLevel: 'H',
                scale: 8
            });
            await sock.sendMessage(chatId, { image: { url: qr }, caption: 'âœ… QR Code Generated' }, { quoted: message });
        }
        catch (err) {
            console.error('QR plugin error:', err);
            await sock.sendMessage(chatId, { text: 'âŒ Failed to generate QR code.' }, { quoted: message });
        }
    }
};




