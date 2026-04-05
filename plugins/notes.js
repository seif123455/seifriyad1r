import store from '../lib/lightweight_store.js';
const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);
const notesDB = {};
async function getUserNotes(userId) {
    if (HAS_DB) {
        const notes = await store.getSetting(userId, 'notes');
        return notes || [];
    }
    else {
        return notesDB[userId] || [];
    }
}
async function saveUserNotes(userId, notes) {
    if (HAS_DB) {
        await store.saveSetting(userId, 'notes', notes);
    }
    else {
        notesDB[userId] = notes;
    }
}
export default {
    command: 'نوتيس',
    aliases: ['note', 'notes'],
    category: 'قوائم',
    description: 'ستوري, عرض, اند حذف يوور بيرسونال ملاحظةس',
    usage: '.ملاحظةس <إضافة|الل|ديل|ديلالل> [نص|معرف]',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const sender = message.key.participant || message.key.remoteJid;
        try {
            const action = args[0] ? args[0].toLowerCase() : null;
            const content = args.slice(1).join(" ").trim();
            const menuText = `
â•­â”€â”€â”€â”€â”€ *ã€Ž NOTES ã€* â”€â”€â”€â—†
â”ƒ Store notes for later use
â”ƒ Storage: ${HAS_DB ? 'Database ðŸ—„ï¸' : 'Memory ðŸ“'}
â”ƒ
â”ƒ â— Add Note
â”ƒ    .notes add your text here
â”ƒ
â”ƒ â— Get All Notes
â”ƒ    .notes all
â”ƒ
â”ƒ â— Delete Note
â”ƒ    .notes del noteID
â”ƒ
â”ƒ â— Delete All Notes
â”ƒ    .notes delall
â•°â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”€â”€âŠ·`;
            if (!action) {
                return await sock.sendMessage(chatId, { text: menuText }, { quoted: message });
            }
            if (action === 'add') {
                if (!content) {
                    return await sock.sendMessage(chatId, {
                        text: "*Please write a note to save.*\nExample: .notes add buy milk"
                    }, { quoted: message });
                }
                const userNotes = await getUserNotes(sender);
                const newID = userNotes.length + 1;
                userNotes.push({ id: newID, text: content, createdAt: Date.now() });
                await saveUserNotes(sender, userNotes);
                return await sock.sendMessage(chatId, {
                    text: `âœ… Note saved.\nID: ${newID}\nStorage: ${HAS_DB ? 'Database' : 'Memory'}`
                }, { quoted: message });
            }
            if (action === 'all') {
                const userNotes = await getUserNotes(sender);
                if (userNotes.length === 0) {
                    return await sock.sendMessage(chatId, { text: "*You have no notes saved.*" }, { quoted: message });
                }
                const list = userNotes.map((n) => `${n.id}. ${n.text}`).join("\n");
                return await sock.sendMessage(chatId, {
                    text: `*ðŸ“ Your Notes:*\n\n${list}\n\n_Total: ${userNotes.length} notes_`
                }, { quoted: message });
            }
            if (action === 'del') {
                const id = parseInt(args[1], 10);
                const userNotes = await getUserNotes(sender);
                if (!id || !userNotes.find((n) => n.id === id)) {
                    return await sock.sendMessage(chatId, {
                        text: "Invalid note ID.\nExample: .notes del 1"
                    }, { quoted: message });
                }
                const filteredNotes = userNotes.filter((n) => n.id !== id);
                await saveUserNotes(sender, filteredNotes);
                return await sock.sendMessage(chatId, { text: `*âœ… Note ID ${id} deleted.*` }, { quoted: message });
            }
            if (action === 'delall') {
                const userNotes = await getUserNotes(sender);
                if (userNotes.length === 0) {
                    return await sock.sendMessage(chatId, { text: "*You have no notes to delete.*" }, { quoted: message });
                }
                await saveUserNotes(sender, []);
                return await sock.sendMessage(chatId, { text: "*âœ… All notes deleted successfully.*" }, { quoted: message });
            }
            return await sock.sendMessage(chatId, { text: menuText }, { quoted: message });
        }
        catch (err) {
            console.error("Notes Command Error:", err);
            await sock.sendMessage(chatId, { text: "âŒ Error in notes module." }, { quoted: message });
        }
    }
};




