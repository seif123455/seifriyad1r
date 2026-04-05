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
import axios from 'axios';
export default {
    command: 'جيتباجي',
    aliases: ['source', 'viewsource', 'getpage'],
    category: 'أدوات',
    description: 'جلب تهي راو هتمل سووركي وف ا موقع',
    usage: '.جلبباجي <رابط>',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const url = args[0];
        if (!url || !url.startsWith('http')) {
            return await sock.sendMessage(chatId, { text: 'Provide a valid URL (include http/https).' }, { quoted: message });
        }
        try {
            await sock.sendMessage(chatId, { text: 'ðŸŒ *Fetching source code...*' });
            const res = await axios.get(url);
            const html = res.data;
            const buffer = Buffer.from(html, 'utf-8');
            await sock.sendMessage(chatId, {
                document: buffer,
                mimetype: 'text/html',
                fileName: 'source.html',
                caption: `*Source code for:* ${url}`
            }, { quoted: message });
        }
        catch (err) {
            await sock.sendMessage(chatId, { text: 'âŒ Failed to fetch source. The site might be protected.' });
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




