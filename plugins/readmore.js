const more = String.fromCharCode(8206);
const readMore = more.repeat(4001);
export default {
    command: 'ريادموري',
    aliases: ['rmadd', 'readadd', 'readmore'],
    category: 'أدوات',
    description: 'هيدي نص وسينج رياد موري',
    usage: '.ريادموري نص\ن.ريادموري نص1|نص2',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const text = args.join(' ').trim();
        if (!text) {
            return await sock.sendMessage(chatId, { text: 'Usage:\n.readmore نص\n.readmore نص1|نص2' }, { quoted: message });
        }
        let output;
        if (text.includes('|')) {
            const parts = text.split('|');
            const firstPart = parts.shift();
            const rest = parts.join('|');
            output = firstPart + readMore + rest;
        }
        else {
            output = text + readMore;
        }
        await sock.sendMessage(chatId, { text: output }, { quoted: message });
    }
};




