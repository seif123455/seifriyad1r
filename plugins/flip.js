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
    command: 'فليب',
    aliases: ['mirror', 'upside', 'flip'],
    category: 'أدوات',
    description: 'فليب نص وبسيدي دوون (سوببورتس وببيركاسي)',
    usage: '.فليب <نص> ور رد تو ا رسالة',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        let txt = args?.join(' ') || "";
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (quoted) {
            txt = quoted.conversation || quoted.extendedTextMessage?.text || quoted.imageMessage?.caption || txt;
        }
        txt = txt.replace(/^\.\w+\s*/, '').trim();
        if (!txt)
            return await sock.sendMessage(chatId, { text: '*What should I flip?*' });
        const charMap = {
            'a': 'É', 'b': 'q', 'c': 'É”', 'd': 'p', 'e': 'Ç', 'f': 'ÉŸ', 'g': 'Æƒ', 'h': 'É¥', 'i': 'á´‰', 'j': 'É¾',
            'k': 'Êž', 'l': 'l', 'm': 'É¯', 'n': 'u', 'o': 'o', 'p': 'd', 'q': 'b', 'r': 'É¹', 's': 's', 't': 'Ê‡',
            'u': 'n', 'v': 'ÊŒ', 'w': 'Ê', 'x': 'x', 'y': 'ÊŽ', 'z': 'z',
            'A': 'âˆ€', 'B': 'á—º', 'C': 'Æ†', 'D': 'p', 'E': 'ÆŽ', 'F': 'â„²', 'G': '×¤', 'H': 'H', 'I': 'I', 'J': 'Å¿',
            'K': 'Êž', 'L': 'Ë¥', 'M': 'W', 'N': 'N', 'O': 'O', 'P': 'Ô€', 'Q': 'ÎŒ', 'R': 'á´š', 'S': 'S', 'T': 'âŠ¥',
            'U': 'âˆ©', 'V': 'Î›', 'W': 'M', 'X': 'X', 'Y': 'â…„', 'Z': 'Z',
            '1': 'Æ–', '2': 'á„…', '3': 'Æ', '4': 'ã„£', '5': 'Ï›', '6': '9', '7': 'ã„¥', '8': '8', '9': '6', '0': '0',
            '.': 'Ë™', ',': '\'', '\'': ',', '"': 'â€ž', '!': 'Â¡', '?': 'Â¿', '(': ')', ')': '(', '[': ']', ']': '[',
            '{': '}', '}': '{', '<': '>', '>': '<', '_': 'â€¾', '&': 'â…‹'
        };
        const flipped = txt.split('').map((char) => charMap[char] || char).reverse().join('');
        await sock.sendMessage(chatId, { text: flipped }, { quoted: message });
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




