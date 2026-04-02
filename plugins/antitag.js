import { setAntitag, getAntitag, removeAntitag } from '../lib/index.js';

export async function handleTagDetection(sock, chatId, message, senderId) {
    try {
        const antitagSetting = await getAntitag(chatId, 'on');
        if (!antitagSetting || !antitagSetting.enabled) return;
        
        const mentionedJids = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        const messageText = (message.message?.conversation ||
            message.message?.extendedTextMessage?.text ||
            message.message?.imageMessage?.caption ||
            message.message?.videoMessage?.caption ||
            '');
        const textMentions = messageText.match(/@[\d+\s\-()~.]+/g) || [];
        const numericMentions = messageText.match(/@\d{10,}/g) || [];
        const _allMentions = [...new Set([...mentionedJids, ...textMentions, ...numericMentions])];
        
        const uniqueNumericMentions = new Set();
        numericMentions.forEach((mention) => {
            const numMatch = mention.match(/@(\d+)/);
            if (numMatch) uniqueNumericMentions.add(numMatch[1]);
        });
        
        const mentionedJidCount = mentionedJids.length;
        const numericMentionCount = uniqueNumericMentions.size;
        const totalMentions = Math.max(mentionedJidCount, numericMentionCount);
        
        if (totalMentions >= 3) {
            const groupMetadata = await sock.groupMetadata(chatId);
            const participants = groupMetadata.participants || [];
            const mentionThreshold = Math.ceil(participants.length * 0.5);
            const hasManyNumericMentions = numericMentionCount >= 10 ||
                (numericMentionCount >= 5 && numericMentionCount >= mentionThreshold);
            
            if (totalMentions >= mentionThreshold || hasManyNumericMentions) {
                const action = antitagSetting.action || 'delete';
                
                if (action === 'delete') {
                    await sock.sendMessage(chatId, {
                        delete: {
                            remoteJid: chatId,
                            fromMe: false,
                            id: message.key.id,
                            participant: senderId
                        }
                    });
                    await sock.sendMessage(chatId, {
                        text: `⚠️ *تم اكتشاف منشن للكل!*\n\n@${senderId.split('@')[0]}, منشن جميع الأعضاء غير مسموح به.`,
                        mentions: [senderId]
                    });
                } else if (action === 'kick') {
                    await sock.sendMessage(chatId, {
                        delete: {
                            remoteJid: chatId,
                            fromMe: false,
                            id: message.key.id,
                            participant: senderId
                        }
                    });
                    try {
                        await sock.groupParticipantsUpdate(chatId, [senderId], "remove");
                        await sock.sendMessage(chatId, {
                            text: `🚫 *تم تطبيق منع المنشن!*\n\n@${senderId.split('@')[0]} تم طرده بسبب منشن جميع الأعضاء.`,
                            mentions: [senderId]
                        });
                    } catch (error) {
                        await sock.sendMessage(chatId, {
                            text: `⚠️ فشل طرد المستخدم. تأكد من أن البوت أدمن.`
                        });
                    }
                }
            }
        }
    } catch (error) {
        console.error('خطأ في كشف المنشن:', error);
    }
}

export default {
    command: 'منشن',
    aliases: ['antitag', 'at', 'tagblock', 'منع_المنشن'],
    category: 'admin',
    description: 'منع المستخدمين من منشن جميع الأعضاء',
    usage: '!منشن <on|off|set>',
    groupOnly: true,
    adminOnly: true,
    
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const action = args[0]?.toLowerCase();
        
        if (!action) {
            const config = await getAntitag(chatId, 'on');
            await sock.sendMessage(chatId, {
                text: `*🏷️ إعدادات منع المنشن*\n\n` +
                    `*الحالة:* ${config?.enabled ? '✅ مفعل' : '❌ معطل'}\n` +
                    `*الإجراء:* ${config?.action || 'غير محدد'}\n\n` +
                    `*الأوامر:*\n` +
                    `• \`!منشن on\` - تفعيل\n` +
                    `• \`!منشن off\` - تعطيل\n` +
                    `• \`!منشن set delete\` - حذف رسائل منشن الكل\n` +
                    `• \`!منشن set kick\` - طرد المستخدمين الذين يعملون منشن للكل\n\n` +
                    `*الكشف:*\n` +
                    `• يكشف منشن 50%+ من الأعضاء\n` +
                    `• يحمي من التكرار والإزعاج`
            }, { quoted: message });
            return;
        }
        
        switch (action) {
            case 'on':
                const existingConfig = await getAntitag(chatId, 'on');
                if (existingConfig?.enabled) {
                    await sock.sendMessage(chatId, {
                        text: '⚠️ *منع المنشن مفعل بالفعل*'
                    }, { quoted: message });
                    return;
                }
                const result = await setAntitag(chatId, 'on', 'delete');
                await sock.sendMessage(chatId, {
                    text: result
                        ? '✅ *تم تفعيل منع المنشن بنجاح!*\n\nالإجراء الافتراضي: حذف رسائل منشن الكل'
                        : '❌ *فشل في تفعيل منع المنشن*'
                }, { quoted: message });
                break;
                
            case 'off':
                await removeAntitag(chatId, 'on');
                await sock.sendMessage(chatId, {
                    text: '❌ *تم تعطيل منع المنشن*\n\nيمكن للمستخدمين الآن منشن جميع الأعضاء.'
                }, { quoted: message });
                break;
                
            case 'set':
                if (args.length < 2) {
                    await sock.sendMessage(chatId, {
                        text: '❌ *الرجاء تحديد الإجراء*\n\nالاستخدام: `!منشن set delete | kick`'
                    }, { quoted: message });
                    return;
                }
                const setAction = args[1].toLowerCase();
                if (!['delete', 'kick'].includes(setAction)) {
                    await sock.sendMessage(chatId, {
                        text: '❌ *إجراء غير صحيح*\n\nاختر: delete أو kick'
                    }, { quoted: message });
                    return;
                }
                const setResult = await setAntitag(chatId, 'on', setAction);
                const actionDescriptions = {
                    delete: 'حذف رسائل منشن الكل وتحذير المستخدمين',
                    kick: 'حذف الرسائل وطرد المستخدمين من المجموعة'
                };
                await sock.sendMessage(chatId, {
                    text: setResult
                        ? `✅ *تم ضبط إجراء منع المنشن إلى: ${setAction === 'delete' ? 'حذف' : 'طرد'}*\n\n${actionDescriptions[setAction]}`
                        : '❌ *فشل في ضبط إجراء منع المنشن*'
                }, { quoted: message });
                break;
                
            case 'status':
            case 'get':
                const status = await getAntitag(chatId, 'on');
                await sock.sendMessage(chatId, {
                    text: `*🏷️ حالة منع المنشن*\n\n` +
                        `*الحالة:* ${status?.enabled ? '✅ مفعل' : '❌ معطل'}\n` +
                        `*الإجراء:* ${status?.action === 'delete' ? 'حذف' : status?.action === 'kick' ? 'طرد' : 'غير محدد'}\n\n` +
                        `*ماذا يحدث عند اكتشاف منشن الكل:*\n` +
                        `${status?.action === 'delete' ? '• يتم حذف الرسالة\n• يتم تحذير المستخدم' : ''}` +
                        `${status?.action === 'kick' ? '• يتم حذف الرسالة\n• يتم طرد المستخدم من المجموعة' : ''}\n\n` +
                        `*حد الكشف:* 50% من أعضاء المجموعة أو 10+ منشن`
                }, { quoted: message });
                break;
                
            default:
                await sock.sendMessage(chatId, {
                    text: '❌ *أمر غير صحيح*\n\nاستخدم `!منشن` لرؤية الخيارات المتاحة.'
                }, { quoted: message });
        }
    },
    handleTagDetection
};