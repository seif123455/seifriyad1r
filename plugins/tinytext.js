/*****************************************************************************
 *                                                                           *
 *                     Developed By Crazy Seif                                *
 *                                                                           *
 *  ðŸŒ  GitHub   : https://github.com/CrazySeif                         *
 *  â–¶ï¸  YouTube  : https://youtube.com/@CrazySeif                       *
 *  ðŸ’¬  WhatsApp : https://whatsapp.com/channel/0029VagJIAr3bbVBCpEkAM07     *
 *                                                                           *
 *    Â© 2026 CrazySeif. All rights reserved.                            *
 *                                                                           *
 *    Description: This file is part of the MEGA-MD Project.                 *
 *                 Unauthorized copying or distribution is prohibited.       *
 *                                                                           *
 *****************************************************************************/
export default {
    command: 'سماللكابس',
    aliases: ['tinytext', 'mini', 'smallcaps'],
    category: 'أدوات',
    description: 'تحويل نص تو سمالل-كابيتال ستيلي',
    usage: '.سماللكابس <نص> ور رد تو ا رسالة',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        try {
            let txt = args?.join(' ') || "";
            const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (quoted) {
                txt = quoted.conversation || quoted.extendedTextMessage?.text || quoted.imageMessage?.caption || txt;
            }
            txt = txt.replace(/^\.\w+\s*/, '').trim();
            if (!txt) {
                return await sock.sendMessage(chatId, {
                    text: 'Please provide text or reply to a message to convert.\nExample: `.smallcaps Hello World`'
                }, { quoted: message });
            }
            const capsMap = {
                'a': 'á´€', 'b': 'Ê™', 'c': 'á´„', 'd': 'á´…', 'e': 'á´‡', 'f': 'êœ°', 'g': 'É¢', 'h': 'Êœ', 'i': 'Éª', 'j': 'á´Š',
                'k': 'á´‹', 'l': 'ÊŸ', 'm': 'á´', 'n': 'É´', 'o': 'á´', 'p': 'á´˜', 'q': 'Ç«', 'r': 'Ê€', 's': 's', 't': 'á´›',
                'u': 'á´œ', 'v': 'á´ ', 'w': 'á´¡', 'x': 'x', 'y': 'Ê', 'z': 'á´¢',
                'A': 'á´€', 'B': 'Ê™', 'C': 'á´„', 'D': 'á´…', 'E': 'á´‡', 'F': 'êœ°', 'G': 'É¢', 'H': 'Êœ', 'I': 'Éª', 'J': 'á´Š',
                'K': 'á´‹', 'L': 'ÊŸ', 'M': 'á´', 'N': 'É´', 'O': 'á´', 'P': 'á´˜', 'Q': 'Ç«', 'R': 'Ê€', 'S': 's', 'T': 'á´›',
                'U': 'á´œ', 'V': 'á´ ', 'W': 'á´¡', 'X': 'x', 'Y': 'Ê', 'Z': 'á´¢',
                '0': 'â°', '1': 'Â¹', '2': 'Â²', '3': 'Â³', '4': 'â´', '5': 'âµ', '6': 'â¶', '7': 'â·', '8': 'â¸', '9': 'â¹'
            };
            const result = txt.split('').map((char) => capsMap[char] || char).join('');
            await sock.sendMessage(chatId, { text: result }, { quoted: message });
        }
        catch (err) {
            console.error('SmallCaps Error:', err);
            await sock.sendMessage(chatId, { text: 'âŒ Failed to process text.' });
        }
    }
};
/*****************************************************************************
 *                                                                           *
 *                     Developed By Crazy Seif                                *
 *                                                                           *
 *  ðŸŒ  GitHub   : https://github.com/CrazySeif                         *
 *  â–¶ï¸  YouTube  : https://youtube.com/@CrazySeif                       *
 *  ðŸ’¬  WhatsApp : https://whatsapp.com/channel/0029VagJIAr3bbVBCpEkAM07     *
 *                                                                           *
 *    Â© 2026 CrazySeif. All rights reserved.                            *
 *                                                                           *
 *    Description: This file is part of the MEGA-MD Project.                 *
 *                 Unauthorized copying or distribution is prohibited.       *
 *                                                                           *
 *****************************************************************************/




