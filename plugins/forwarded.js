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
    command: 'فوروارديد',
    aliases: ['viral', 'fakeforward', 'forwarded'],
    category: 'أدوات',
    description: 'إرسال نص ويته ا فاكي "فريقوينتلي فوروارديد" تاج',
    usage: '.فيرال <نص> ور رد تو ا رسالة',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        try {
            let txt = "";
            const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (quoted) {
                txt = quoted.conversation ||
                    quoted.extendedTextMessage?.text ||
                    quoted.imageMessage?.caption ||
                    quoted.videoMessage?.caption ||
                    "";
            }
            if (!txt || txt.trim() === "") {
                txt = args?.join(' ') || "";
            }
            if (!txt || txt.trim() === "") {
                return await sock.sendMessage(chatId, {
                    text: 'Please provide text or reply to a message to forward.'
                }, { quoted: message });
            }
            await sock.sendMessage(chatId, {
                text: txt,
                contextInfo: {
                    isForwarded: true,
                    forwardingScore: 999
                }
            });
        }
        catch (err) {
            console.error('Forwarding Spoof Error:', err);
            await sock.sendMessage(chatId, { text: 'âŒ Failed to spoof forwarding.' });
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




