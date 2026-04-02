import fs from 'fs';
import store from '../lib/lightweight_store.js';

const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);
const bannedFilePath = './data/banned.json';

async function getBannedUsers() {
    if (HAS_DB) {
        const banned = await store.getSetting('global', 'banned');
        return banned || [];
    } else {
        if (fs.existsSync(bannedFilePath)) {
            return JSON.parse(fs.readFileSync(bannedFilePath, "utf-8"));
        }
        return [];
    }
}

async function saveBannedUsers(bannedUsers) {
    if (HAS_DB) {
        await store.saveSetting('global', 'banned', bannedUsers);
    } else {
        if (!fs.existsSync('./data')) {
            fs.mkdirSync('./data', { recursive: true });
        }
        fs.writeFileSync(bannedFilePath, JSON.stringify(bannedUsers, null, 2));
    }
}

export default {
    command: 'الغاء_حظر',
    aliases: ['unban', 'pardon', 'الغاء_المنع', 'فك_الحظر'],
    category: 'admin',
    description: 'إلغاء حظر مستخدم من استخدام البوت',
    usage: '!الغاء_حظر [@المستخدم] أو رد على رسالة',
    ownerOnly: false,
    
    async handler(sock, message, args, context) {
        const { chatId, isGroup, channelInfo, senderIsOwnerOrSudo, isSenderAdmin, isBotAdmin } = context;
        
        if (isGroup) {
            if (!isBotAdmin) {
                await sock.sendMessage(chatId, {
                    text: '⚠️ *الغاء الحظر*\n\nالرجاء جعل البوت أدمن لاستخدام هذا الأمر.',
                    ...channelInfo
                }, { quoted: message });
                return;
            }
            if (!isSenderAdmin && !message.key.fromMe && !senderIsOwnerOrSudo) {
                await sock.sendMessage(chatId, {
                    text: '⚠️ *الغاء الحظر*\n\nفقط مشرفي المجموعة يمكنهم استخدام هذا الأمر.',
                    ...channelInfo
                }, { quoted: message });
                return;
            }
        } else {
            if (!message.key.fromMe && !senderIsOwnerOrSudo) {
                await sock.sendMessage(chatId, {
                    text: '⚠️ *الغاء الحظر*\n\nفقط المالك يمكنه استخدام هذا الأمر في الخاص.',
                    ...channelInfo
                }, { quoted: message });
                return;
            }
        }
        
        let userToUnban;
        
        if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            userToUnban = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
        } else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
            userToUnban = message.message.extendedTextMessage.contextInfo.participant;
        }
        
        if (!userToUnban) {
            await sock.sendMessage(chatId, {
                text: '👤 *الغاء الحظر*\n\n' +
                    '*الاستخدام:* `!الغاء_حظر @المستخدم`\n' +
                    '*مثال:* `!الغاء_حظر @username`\n\n' +
                    '*أو رد على رسالة الشخص ثم اكتب:* `!الغاء_حظر`',
                ...channelInfo
            }, { quoted: message });
            return;
        }
        
        try {
            const bannedUsers = await getBannedUsers();
            const index = bannedUsers.indexOf(userToUnban);
            
            if (index > -1) {
                bannedUsers.splice(index, 1);
                await saveBannedUsers(bannedUsers);
                
                const userName = sock.store?.contacts?.[userToUnban]?.name || 
                               sock.store?.contacts?.[userToUnban]?.notify || 
                               userToUnban.split('@')[0];
                
                await sock.sendMessage(chatId, {
                    text: `✅ *تم إلغاء الحظر*\n\n` +
                        `┏━━━━━━━━━━━━━━━━━━━━━━┓\n` +
                        `┃ 👤 *المستخدم:* ${userName}\n` +
                        `┃ 🆔 *الرقم:* @${userToUnban.split('@')[0]}\n` +
                        `┣━━━━━━━━━━━━━━━━━━━━━━┫\n` +
                        `┃ 💾 *التخزين:* ${HAS_DB ? 'قاعدة بيانات' : 'ملفات'}\n` +
                        `┗━━━━━━━━━━━━━━━━━━━━━━┛\n\n` +
                        `🔥 *CRAZY-SEIF BOT* | 📞 201144534147`,
                    mentions: [userToUnban],
                    ...channelInfo
                }, { quoted: message });
            } else {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *المستخدم غير محظور*\n\n@${userToUnban.split('@')[0]} ليس محظوراً من استخدام البوت.`,
                    mentions: [userToUnban],
                    ...channelInfo
                }, { quoted: message });
            }
        } catch (error) {
            console.error('خطأ في أمر إلغاء الحظر:', error);
            await sock.sendMessage(chatId, {
                text: '❌ فشل في إلغاء حظر المستخدم!',
                ...channelInfo
            }, { quoted: message });
        }
    }
};