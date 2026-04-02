import fs from 'fs';
import path from 'path';
import store from '../lib/lightweight_store.js';

const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);
const databaseDir = path.join(process.cwd(), 'data');
const warningsPath = path.join(databaseDir, 'warnings.json');

function initializeWarningsFile() {
    if (!HAS_DB) {
        if (!fs.existsSync(databaseDir)) {
            fs.mkdirSync(databaseDir, { recursive: true });
        }
        if (!fs.existsSync(warningsPath)) {
            fs.writeFileSync(warningsPath, JSON.stringify({}), 'utf8');
        }
    }
}

async function getWarnings() {
    if (HAS_DB) {
        const warnings = await store.getSetting('global', 'warnings');
        return warnings || {};
    } else {
        try {
            return JSON.parse(fs.readFileSync(warningsPath, 'utf8'));
        } catch (error) {
            return {};
        }
    }
}

async function saveWarnings(warnings) {
    if (HAS_DB) {
        await store.saveSetting('global', 'warnings', warnings);
    } else {
        fs.writeFileSync(warningsPath, JSON.stringify(warnings, null, 2));
    }
}

export default {
    command: 'تحذير',
    aliases: ['warn', 'warning', 'انذار'],
    category: 'admin',
    description: 'تحذير مستخدم (الطرد التلقائي بعد 3 تحذيرات)',
    usage: '!تحذير [@المستخدم] أو رد على رسالة',
    groupOnly: true,
    adminOnly: true,
    
    async handler(sock, message, args, context) {
        const { chatId, senderId, channelInfo } = context;
        
        try {
            initializeWarningsFile();
            
            let userToWarn;
            const mentionedJids = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            
            if (mentionedJids && mentionedJids.length > 0) {
                userToWarn = mentionedJids[0];
            } else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
                userToWarn = message.message.extendedTextMessage.contextInfo.participant;
            }
            
            if (!userToWarn) {
                await sock.sendMessage(chatId, {
                    text: '⚠️ *تحذير مستخدم*\n\n' +
                        '*الاستخدام:* `!تحذير @المستخدم`\n' +
                        '*مثال:* `!تحذير @username`\n\n' +
                        '*أو رد على رسالة الشخص ثم اكتب:* `!تحذير`',
                    ...channelInfo
                }, { quoted: message });
                return;
            }
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            try {
                const warnings = await getWarnings();
                if (!warnings[chatId]) warnings[chatId] = {};
                if (!warnings[chatId][userToWarn]) warnings[chatId][userToWarn] = 0;
                
                warnings[chatId][userToWarn]++;
                await saveWarnings(warnings);
                
                const userName = sock.store?.contacts?.[userToWarn]?.name || 
                               sock.store?.contacts?.[userToWarn]?.notify || 
                               userToWarn.split('@')[0];
                
                const warningCount = warnings[chatId][userToWarn];
                let remainingWarns = 3 - warningCount;
                let warnStatus = '';
                
                if (remainingWarns === 2) {
                    warnStatus = '⚠️ تحذير واحد متبقي قبل الطرد';
                } else if (remainingWarns === 1) {
                    warnStatus = '🔴 تحذير أخير!';
                } else {
                    warnStatus = 'سيتم طرد المستخدم';
                }
                
                const warningMessage = `*『 ⚠️ تحذير 』*\n\n` +
                    `👤 *المستخدم:* ${userName}\n` +
                    `⚠️ *عدد التحذيرات:* ${warningCount}/3\n` +
                    `📊 *المتبقي:* ${remainingWarns} تحذيرات\n` +
                    `👑 *تم بواسطة:* @${senderId.split('@')[0]}\n` +
                    `💾 *التخزين:* ${HAS_DB ? 'قاعدة بيانات' : 'ملفات'}\n\n` +
                    `📅 *التاريخ:* ${new Date().toLocaleString('ar-EG')}\n\n` +
                    `${warnStatus === 'سيتم طرد المستخدم' ? '🚫 سيتم طرد المستخدم تلقائياً بعد 3 تحذيرات!' : `⚠️ ${warnStatus}`}`;
                
                await sock.sendMessage(chatId, {
                    text: warningMessage,
                    mentions: [userToWarn, senderId],
                    ...channelInfo
                });
                
                if (warnings[chatId][userToWarn] >= 3) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    await sock.groupParticipantsUpdate(chatId, [userToWarn], "remove");
                    delete warnings[chatId][userToWarn];
                    await saveWarnings(warnings);
                    
                    const kickMessage = `*『 🚫 طرد تلقائي 』*\n\n` +
                        `@${userToWarn.split('@')[0]} تم طرده من المجموعة بعد وصوله لـ 3 تحذيرات! ⚠️\n\n` +
                        `🔥 *CRAZY-SEIF BOT* | 📞 201144534147`;
                    
                    await sock.sendMessage(chatId, {
                        text: kickMessage,
                        mentions: [userToWarn],
                        ...channelInfo
                    });
                }
                
            } catch (error) {
                console.error('خطأ في أمر التحذير:', error);
                await sock.sendMessage(chatId, {
                    text: '❌ فشل في تحذير المستخدم!',
                    ...channelInfo
                }, { quoted: message });
            }
            
        } catch (error) {
            console.error('خطأ في أمر التحذير:', error);
            
            if (error.data === 429) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                try {
                    await sock.sendMessage(chatId, {
                        text: '❌ تم تجااز الحد المسموح. حاول مرة أخرى بعد بضع ثوانٍ.',
                        ...channelInfo
                    }, { quoted: message });
                } catch (retryError) {
                    console.error('خطأ في إرسال رسالة إعادة المحاولة:', retryError);
                }
            } else {
                try {
                    await sock.sendMessage(chatId, {
                        text: '❌ فشل في تحذير المستخدم. تأكد من أن البوت أدمن ولديه الصلاحيات الكافية.',
                        ...channelInfo
                    }, { quoted: message });
                } catch (sendError) {
                    console.error('خطأ في إرسال رسالة الخطأ:', sendError);
                }
            }
        }
    }
};