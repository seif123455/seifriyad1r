import store from '../lib/lightweight_store.js';
import isOwnerOrSudo from '../lib/isOwner.js';
import isAdmin from '../lib/isAdmin.js';

async function setAntilink(chatId, type, action) {
    try {
        await store.saveSetting(chatId, 'antilink', {
            enabled: true,
            action,
            type
        });
        return true;
    } catch (error) {
        console.error('خطأ في حفظ إعدادات منع الروابط:', error);
        return false;
    }
}

async function getAntilink(chatId, _type) {
    try {
        const settings = await store.getSetting(chatId, 'antilink');
        return settings || null;
    } catch (error) {
        console.error('خطأ في جلب إعدادات منع الروابط:', error);
        return null;
    }
}

async function removeAntilink(chatId, _type) {
    try {
        await store.saveSetting(chatId, 'antilink', {
            enabled: false,
            action: null,
            type: null
        });
        return true;
    } catch (error) {
        console.error('خطأ في إلغاء منع الروابط:', error);
        return false;
    }
}

export async function handleLinkDetection(sock, chatId, message, userMessage, senderId) {
    try {
        const config = await getAntilink(chatId, 'on');
        if (!config?.enabled) return;

        const isOwnerSudo = await isOwnerOrSudo(senderId, sock, chatId);
        if (isOwnerSudo) return;

        try {
            const { isSenderAdmin } = await isAdmin(sock, chatId, senderId);
            if (isSenderAdmin) return;
        } catch (e) {}

        const action = config.action || 'delete';
        let shouldAct = false;
        let linkType = '';

        const linkPatterns = {
            whatsappGroup: /chat\.whatsapp\.com\/[A-Za-z0-9]{20,}/i,
            whatsappChannel: /wa\.me\/channel\/[A-Za-z0-9]{20,}/i,
            telegram: /t\.me\/[A-Za-z0-9_]+/i,
            allLinks: /https?:\/\/\S+|www\.\S+|(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/\S*)?/i,
        };

        if (linkPatterns.whatsappGroup.test(userMessage)) {
            shouldAct = true;
            linkType = 'رابط جروب واتساب';
        } else if (linkPatterns.whatsappChannel.test(userMessage)) {
            shouldAct = true;
            linkType = 'رابط قناة واتساب';
        } else if (linkPatterns.telegram.test(userMessage)) {
            shouldAct = true;
            linkType = 'رابط تيليجرام';
        } else if (linkPatterns.allLinks.test(userMessage)) {
            shouldAct = true;
            linkType = 'رابط';
        }

        if (!shouldAct) return;

        const messageId = message.key.id;
        const participant = message.key.participant || senderId;

        if (action === 'delete' || action === 'kick') {
            try {
                await sock.sendMessage(chatId, {
                    delete: {
                        remoteJid: chatId,
                        fromMe: false,
                        id: messageId,
                        participant
                    }
                });
            } catch (error) {
                console.error('فشل حذف الرسالة:', error);
            }
        }

        if (action === 'warn' || action === 'delete') {
            await sock.sendMessage(chatId, {
                text: `⚠️ *تحذير*\n\n@${senderId.split('@')[0]}، ممنوع إرسال ${linkType}!`,
                mentions: [senderId]
            });
        }

        if (action === 'kick') {
            try {
                await sock.groupParticipantsUpdate(chatId, [senderId], 'remove');
                await sock.sendMessage(chatId, {
                    text: `🚫 تم طرد @${senderId.split('@')[0]} بسبب إرسال ${linkType}`,
                    mentions: [senderId]
                });
            } catch (error) {
                console.error('فشل طرد المستخدم:', error);
                await sock.sendMessage(chatId, {
                    text: `⚠️ فشل في طرد المستخدم، تأكد إن البوت أدمن`
                });
            }
        }

    } catch (error) {
        console.error('خطأ في كشف الروابط:', error);
    }
}

export default {
    command: 'منع روابط',
    aliases: ['antilink', 'alink', 'linkblock', 'رابط', 'منع_الروابط'],
    category: 'admin',
    description: 'منع إرسال الروابط في الجروب',
    usage: '!منع روابط <on|off|set>',
    groupOnly: true,
    adminOnly: true,

    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const action = args[0]?.toLowerCase();

        if (!action) {
            const config = await getAntilink(chatId, 'on');
            await sock.sendMessage(chatId, {
                text:
`🔗 *إعدادات منع الروابط*

📊 الحالة: ${config?.enabled ? 'مفعل ✅' : 'متوقف ❌'}
⚙️ الإجراء: ${config?.action || 'غير محدد'}

📌 الأوامر:
• \`!منع روابط on\` → تشغيل
• \`!منع روابط off\` → إيقاف
• \`!منع روابط set delete\` → حذف الرابط
• \`!منع روابط set kick\` → طرد المستخدم
• \`!منع روابط set warn\` → تحذير فقط

🔒 الروابط المحمية:
• جروبات واتساب
• قنوات واتساب
• تيليجرام
• جميع الروابط

👑 الأدمن والمالك مستثنين`
            }, { quoted: message });
            return;
        }

        switch (action) {
            case 'on':
                const existingConfig = await getAntilink(chatId, 'on');
                if (existingConfig?.enabled) {
                    await sock.sendMessage(chatId, {
                        text: '⚠️ النظام مفعل بالفعل'
                    }, { quoted: message });
                    return;
                }

                const result = await setAntilink(chatId, 'on', 'delete');
                await sock.sendMessage(chatId, {
                    text: result
                        ? '✅ تم تشغيل منع الروابط\n📌 الوضع الافتراضي: حذف'
                        : '❌ فشل في التشغيل'
                }, { quoted: message });
                break;

            case 'off':
                await removeAntilink(chatId, 'on');
                await sock.sendMessage(chatId, {
                    text: '❌ تم إيقاف منع الروابط'
                }, { quoted: message });
                break;

            case 'set':
                if (args.length < 2) {
                    await sock.sendMessage(chatId, {
                        text: '❌ حدد نوع الإجراء\nمثال: `!منع روابط set delete`'
                    }, { quoted: message });
                    return;
                }

                const setAction = args[1].toLowerCase();

                if (!['delete', 'kick', 'warn'].includes(setAction)) {
                    await sock.sendMessage(chatId, {
                        text: '❌ اختيار غير صحيح (delete / kick / warn)'
                    }, { quoted: message });
                    return;
                }

                await setAntilink(chatId, 'on', setAction);

                await sock.sendMessage(chatId, {
                    text: `✅ تم التغيير إلى: ${setAction === 'delete' ? 'حذف' : setAction === 'kick' ? 'طرد' : 'تحذير'}`
                }, { quoted: message });
                break;

            default:
                await sock.sendMessage(chatId, {
                    text: '❌ أمر غير صحيح\nاكتب `!منع روابط` للمساعدة'
                }, { quoted: message });
        }
    },

    handleLinkDetection,
    setAntilink,
    getAntilink,
    removeAntilink
};