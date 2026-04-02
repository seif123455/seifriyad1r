import fs from 'fs';
import { dataFile } from '../lib/paths.js';
import store from '../lib/lightweight_store.js';

const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);
const warningsFilePath = dataFile('warnings.json');

async function loadWarnings() {
    if (HAS_DB) {
        const warnings = await store.getSetting('global', 'warnings');
        return warnings || {};
    } else {
        if (!fs.existsSync(warningsFilePath)) {
            fs.writeFileSync(warningsFilePath, JSON.stringify({}), 'utf8');
        }
        const data = fs.readFileSync(warningsFilePath, 'utf8');
        return JSON.parse(data);
    }
}

export default {
    command: 'تحذيرات',
    aliases: ['warnings', 'checkwarn', 'warncount', 'عدد_التحذيرات', 'تحذير'],
    category: 'group',
    description: 'التحقق من عدد تحذيرات المستخدم',
    usage: '!تحذيرات @المستخدم',
    groupOnly: true,
    
    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        const mentionedJidList = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        
        if (mentionedJidList.length === 0) {
            await sock.sendMessage(chatId, {
                text: '⚠️ *التحذيرات*\n\n' +
                    '*الاستخدام:* `!تحذيرات @المستخدم`\n' +
                    '*مثال:* `!تحذيرات @username`\n\n' +
                    '*أو رد على رسالة الشخص ثم اكتب:* `!تحذيرات`',
                ...channelInfo
            }, { quoted: message });
            return;
        }
        
        const userToCheck = mentionedJidList[0];
        const warnings = await loadWarnings();
        const warningCount = (warnings[chatId] && warnings[chatId][userToCheck]) || 0;
        
        const userName = sock.store?.contacts?.[userToCheck]?.name || 
                       sock.store?.contacts?.[userToCheck]?.notify || 
                       userToCheck.split('@')[0];
        
        let statusText = '';
        if (warningCount === 0) {
            statusText = '✅ ليس لديه أي تحذيرات';
        } else if (warningCount === 1) {
            statusText = '⚠️ تحذير واحد';
        } else if (warningCount <= 3) {
            statusText = '⚠️⚠️ تحذيرات قليلة';
        } else {
            statusText = '🔴 تحذيرات كثيرة!';
        }
        
        await sock.sendMessage(chatId, {
            text: `⚠️ *تحذيرات المستخدم*\n\n` +
                `┏━━━━━━━━━━━━━━━━━━━━━━┓\n` +
                `┃ 👤 *المستخدم:* ${userName}\n` +
                `┃ 🆔 *الرقم:* @${userToCheck.split('@')[0]}\n` +
                `┣━━━━━━━━━━━━━━━━━━━━━━┫\n` +
                `┃ 📊 *عدد التحذيرات:* ${warningCount}\n` +
                `┃ 📝 *الحالة:* ${statusText}\n` +
                `┗━━━━━━━━━━━━━━━━━━━━━━┛\n\n` +
                `💾 *التخزين:* ${HAS_DB ? 'قاعدة بيانات' : 'ملفات'}\n\n` +
                `🔥 *CRAZY-SEIF BOT* | 📞 201144534147`,
            mentions: [userToCheck],
            ...channelInfo
        }, { quoted: message });
    }
};