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
import store from '../lib/lightweight_store.js';
import fs from 'fs';
import path from 'path';
import { dataFile } from '../lib/paths.js';
const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);
const STICKER_FILE = dataFile('sticker_commands.json');
async function getStickerCommands() {
    if (HAS_DB) {
        const data = await store.getSetting('global', 'stickerCommands');
        return data || {};
    }
    else {
        try {
            const dir = path.dirname(STICKER_FILE);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            if (!fs.existsSync(STICKER_FILE)) {
                fs.writeFileSync(STICKER_FILE, JSON.stringify({}));
                return {};
            }
            return JSON.parse(fs.readFileSync(STICKER_FILE, 'utf8'));
        }
        catch {
            return {};
        }
    }
}
async function saveStickerCommands(data) {
    if (HAS_DB) {
        await store.saveSetting('global', 'stickerCommands', data);
    }
    else {
        const dir = path.dirname(STICKER_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(STICKER_FILE, JSON.stringify(data, null, 2));
    }
}
export default {
    command: 'سيتكمد',
    aliases: ['addcmd', 'setcmd'],
    category: 'المالك',
    description: 'تعيين ا ملصق كومماند',
    usage: '.سيتكمد <نص>',
    ownerOnly: true,
    async handler(sock, message, args, context) {
        const { chatId, senderId } = context;
        if (!message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            return await sock.sendMessage(chatId, {
                text: 'âœ³ï¸ Please reply to a sticker to set a command'
            }, { quoted: message });
        }
        const quotedMsg = message.message.extendedTextMessage.contextInfo.quotedMessage;
        if (!quotedMsg.stickerMessage) {
            return await sock.sendMessage(chatId, {
                text: 'âš ï¸ Please reply to a sticker, not a regular message'
            }, { quoted: message });
        }
        const fileSha256 = quotedMsg.stickerMessage.fileSha256;
        if (!fileSha256) {
            return await sock.sendMessage(chatId, {
                text: 'âš ï¸ File SHA256 not found'
            }, { quoted: message });
        }
        const text = args.join(' ');
        if (!text) {
            return await sock.sendMessage(chatId, {
                text: 'Command text is missing'
            }, { quoted: message });
        }
        const stickers = await getStickerCommands();
        const hash = Buffer.from(fileSha256).toString('base64');
        if (stickers[hash] && stickers[hash].locked) {
            return await sock.sendMessage(chatId, {
                text: 'âš ï¸ You do not have permission to change this sticker command'
            }, { quoted: message });
        }
        stickers[hash] = {
            text,
            mentionedJid: message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [],
            creator: senderId,
            at: Date.now(),
            locked: false,
        };
        await saveStickerCommands(stickers);
        await sock.sendMessage(chatId, {
            text: 'âœ… Command saved successfully'
        }, { quoted: message });
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




