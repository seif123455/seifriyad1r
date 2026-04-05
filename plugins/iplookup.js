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
    command: 'وهويسيب',
    aliases: ['ip', 'iplookup', 'whoisip'],
    category: 'البحث',
    description: 'جلب لوكاتيون معلومات فروم ان يب ور دوماين',
    usage: '.يب <اددريسس/دوماين>',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const query = args[0];
        if (!query)
            return await sock.sendMessage(chatId, { text: 'Enter an IP or Domain (e.g., google.com).' });
        try {
            const res = await axios.get(`http://ip-api.com/json/${query}?fields=status,message,country,regionName,city,zip,isp,org,as,query`);
            const data = res.data;
            if (data.status === 'fail')
                return await sock.sendMessage(chatId, { text: `âŒ Error: ${data.message}` });
            const info = `
ðŸŒ *IP/Domain Lookup*
---
ðŸ“ *Target:* ${data.query}
ðŸŒ *Country:* ${data.country}
ðŸ™ï¸ *City/Region:* ${data.city}, ${data.regionName}
ðŸ“® *Zip:* ${data.zip}
ðŸ“¡ *ISP:* ${data.isp}
ðŸ¢ *Organization:* ${data.org}
      `.trim();
            await sock.sendMessage(chatId, { text: info }, { quoted: message });
        }
        catch (err) {
            await sock.sendMessage(chatId, { text: 'âŒ Network error.' });
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



