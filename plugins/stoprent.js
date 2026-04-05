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
const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);
async function deleteCloneSession(authId) {
    if (HAS_DB) {
        await store.saveSetting('clones', authId, null);
    }
    else {
        const sessionPath = path.join(process.cwd(), 'session', 'clones', authId);
        if (fs.existsSync(sessionPath)) {
            fs.rmSync(sessionPath, { recursive: true, force: true });
        }
    }
}
async function getAllCloneAuthIds() {
    if (HAS_DB) {
        const settings = await store.getAllSettings('clones') || {};
        return Object.entries(settings)
            .filter(([_key, value]) => value && value.status)
            .map(([authId]) => authId);
    }
    else {
        const clonesDir = path.join(process.cwd(), 'session', 'clones');
        if (!fs.existsSync(clonesDir))
            return [];
        return fs.readdirSync(clonesDir);
    }
}
async function deleteAllCloneSessions() {
    const authIds = await getAllCloneAuthIds();
    for (const authId of authIds) {
        await deleteCloneSession(authId);
    }
}
export default {
    command: 'Ø³ØªÙˆØ¨Ø±ÙŠÙ†Øª',
    aliases: ['stopclone', 'delrent', 'stoprent'],
    category: 'Ø§Ù„Ù…Ø§Ù„Ùƒ',
    description: 'Ø¥ÙŠÙ‚Ø§Ù Ø§ Ø³Ø¨ÙŠÙƒÙŠÙÙŠÙƒ Ø³ÙˆØ¨-Ø¨ÙˆØª ÙˆØ± Ø§Ù„Ù„ Ø³ÙˆØ¨-Ø¨ÙˆØªØ³',
    usage: '.Ø³ØªÙˆØ¨Ø±ÙŠÙ†Øª [Ø±Ù‚Ù…/Ø§Ù„Ù„]',
    ownerOnly: true,
    async handler(sock, message, args, context) {
        const { chatId } = context;
        if (!global.conns || global.conns.length === 0) {
            return await sock.sendMessage(chatId, {
                text: "âŒ No sub-bots are currently running."
            }, { quoted: message });
        }
        if (!args[0]) {
            return await sock.sendMessage(chatId, {
                text: `âŒ Please provide a number from the list or type 'all'.\nExample: \`.stoprent 1\``
            }, { quoted: message });
        }
        if (args[0].toLowerCase() === 'all') {
            let stoppedCount = 0;
            for (const conn of global.conns) {
                try {
                    await conn.logout();
                    conn.end();
                    stoppedCount++;
                }
                catch (e) {
                    console.error('Error stopping clone:', e.message);
                }
            }
            global.conns = [];
            if (HAS_DB) {
                try {
                    await deleteAllCloneSessions();
                }
                catch (e) {
                    console.error('Error deleting clone sessions:', e.message);
                }
            }
            else {
                const clonesDir = path.join(process.cwd(), 'session', 'clones');
                if (fs.existsSync(clonesDir)) {
                    fs.rmSync(clonesDir, { recursive: true, force: true });
                    fs.mkdirSync(clonesDir, { recursive: true });
                }
            }
            return await sock.sendMessage(chatId, {
                text: `âœ… All sub-bots have been stopped and removed.\n\n` +
                    `Stopped: ${stoppedCount}\n` +
                    `Storage: ${HAS_DB ? 'Database cleared' : 'Files deleted'}`
            }, { quoted: message });
        }
        const index = parseInt(args[0], 10) - 1;
        if (isNaN(index) || !global.conns[index]) {
            return await sock.sendMessage(chatId, {
                text: "âŒ Invalid index number. Check `.listrent` first."
            }, { quoted: message });
        }
        try {
            const target = global.conns[index];
            const targetJid = target.user.id;
            const targetNumber = targetJid.split(':')[0];
            await target.logout();
            global.conns.splice(index, 1);
            if (HAS_DB) {
                const allSettings = await store.getAllSettings('clones') || {};
                for (const [authId, data] of Object.entries(allSettings)) {
                    if (data && data.userNumber === targetNumber) {
                        await deleteCloneSession(authId);
                        break;
                    }
                }
            }
            else {
                const clonesDir = path.join(process.cwd(), 'session', 'clones');
                if (fs.existsSync(clonesDir)) {
                    const dirs = fs.readdirSync(clonesDir);
                    for (const dir of dirs) {
                        const sessionPath = path.join(clonesDir, dir, 'session.json');
                        if (fs.existsSync(sessionPath)) {
                            try {
                                const data = JSON.parse(fs.readFileSync(sessionPath, 'utf-8'));
                                if (data.userNumber === targetNumber) {
                                    fs.rmSync(path.join(clonesDir, dir), { recursive: true, force: true });
                                    break;
                                }
                            }
                            catch (e) {
                                continue;
                            }
                        }
                    }
                }
            }
            await sock.sendMessage(chatId, {
                text: `âœ… Stopped and removed sub-bot: @${targetNumber}\n\n` +
                    `Storage: ${HAS_DB ? 'Database cleared' : 'Files deleted'}`,
                mentions: [targetJid]
            }, { quoted: message });
        }
        catch (err) {
            console.error(err);
            await sock.sendMessage(chatId, {
                text: "âŒ Error while stopping the sub-bot."
            }, { quoted: message });
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


