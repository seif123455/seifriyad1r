import store from '../lib/lightweight_store.js';

async function getAntibadwordSettings(chatId) {
    const settings = await store.getSetting(chatId, 'antibadword');
    return settings || { enabled: false, words: [] };
}

async function saveAntibadwordSettings(chatId, settings) {
    await store.saveSetting(chatId, 'antibadword', settings);
}

async function handleAntiBadwordCommand(sock, chatId, message, match) {
    const args = match.trim().toLowerCase().split(/\s+/);
    const action = args[0];
    const settings = await getAntibadwordSettings(chatId);
    
    if (!action || action === 'status') {
        const status = settings.enabled ? '✅ مفعل' : '❌ معطل';
        const wordCount = settings.words?.length || 0;
        await sock.sendMessage(chatId, {
            text: `*🚫 منع الكلمات البذيئة*\n\n` +
                `📊 *الحالة:* ${status}\n` +
                `📝 *الكلمات المحظورة:* ${wordCount}\n\n` +
                `📌 *الاستخدام:*\n` +
                `• \`!منع on\` - تفعيل\n` +
                `• \`!منع off\` - تعطيل\n` +
                `• \`!منع add <كلمة>\` - إضافة كلمة\n` +
                `• \`!منع remove <كلمة>\` - حذف كلمة\n` +
                `• \`!منع list\` - عرض الكلمات`
        }, { quoted: message });
        return;
    }
    
    if (action === 'on') {
        settings.enabled = true;
        await saveAntibadwordSettings(chatId, settings);
        await sock.sendMessage(chatId, {
            text: '✅ *تم تفعيل منع الكلمات البذيئة*\n\nسيتم حذف أي رسالة تحتوي على كلمات ممنوعة.'
        }, { quoted: message });
        return;
    }
    
    if (action === 'off') {
        settings.enabled = false;
        await saveAntibadwordSettings(chatId, settings);
        await sock.sendMessage(chatId, {
            text: '❌ *تم تعطيل منع الكلمات البذيئة*\n\nلن يتم فلترة الرسائل.'
        }, { quoted: message });
        return;
    }
    
    if (action === 'add') {
        const word = args.slice(1).join(' ').toLowerCase().trim();
        if (!word) {
            await sock.sendMessage(chatId, {
                text: '❌ *الرجاء تحديد الكلمة المراد إضافتها*\n\nمثال: `!منع add كلمة`'
            }, { quoted: message });
            return;
        }
        if (!settings.words) settings.words = [];
        if (settings.words.includes(word)) {
            await sock.sendMessage(chatId, {
                text: `❌ *الكلمة موجودة بالفعل*\n\n"${word}" محظورة بالفعل.`
            }, { quoted: message });
            return;
        }
        settings.words.push(word);
        await saveAntibadwordSettings(chatId, settings);
        await sock.sendMessage(chatId, {
            text: `✅ *تم إضافة الكلمة*\n\nتم إضافة "${word}" إلى قائمة الكلمات المحظورة.\n\nإجمالي الكلمات المحظورة: ${settings.words.length}`
        }, { quoted: message });
        return;
    }
    
    if (action === 'remove' || action === 'delete' || action === 'del') {
        const word = args.slice(1).join(' ').toLowerCase().trim();
        if (!word) {
            await sock.sendMessage(chatId, {
                text: '❌ *الرجاء تحديد الكلمة المراد حذفها*\n\nمثال: `!منع remove كلمة`'
            }, { quoted: message });
            return;
        }
        if (!settings.words || !settings.words.includes(word)) {
            await sock.sendMessage(chatId, {
                text: `❌ *الكلمة غير موجودة*\n\n"${word}" غير موجودة في قائمة الكلمات المحظورة.`
            }, { quoted: message });
            return;
        }
        settings.words = settings.words.filter((w) => w !== word);
        await saveAntibadwordSettings(chatId, settings);
        await sock.sendMessage(chatId, {
            text: `✅ *تم حذف الكلمة*\n\nتم حذف "${word}" من قائمة الكلمات المحظورة.\n\nالكلمات المتبقية: ${settings.words.length}`
        }, { quoted: message });
        return;
    }
    
    if (action === 'list') {
        if (!settings.words || settings.words.length === 0) {
            await sock.sendMessage(chatId, {
                text: '📝 *قائمة الكلمات المحظورة*\n\nلا توجد كلمات محظورة حالياً.\n\nاستخدم `!منع add <كلمة>` لإضافة كلمات.'
            }, { quoted: message });
            return;
        }
        const wordList = settings.words.map((w, i) => `${i + 1}. ${w}`).join('\n');
        await sock.sendMessage(chatId, {
            text: `📝 *قائمة الكلمات المحظورة*\n\n${wordList}\n\n📊 الإجمالي: ${settings.words.length} كلمة`
        }, { quoted: message });
        return;
    }
    
    await sock.sendMessage(chatId, {
        text: '❌ *إجراء غير صحيح*\n\nالاستخدام:\n' +
            '• `!منع on/off`\n' +
            '• `!منع add <كلمة>`\n' +
            '• `!منع remove <كلمة>`\n' +
            '• `!منع list`'
    }, { quoted: message });
}

async function checkAntiBadword(sock, message) {
    const chatId = message.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return false;
    
    const settings = await getAntibadwordSettings(chatId);
    if (!settings.enabled || !settings.words || settings.words.length === 0) return false;
    
    const messageText = (message.message?.conversation ||
        message.message?.extendedTextMessage?.text ||
        message.message?.imageMessage?.caption ||
        message.message?.videoMessage?.caption ||
        '').toLowerCase();
    
    if (!messageText) return false;
    
    for (const word of settings.words) {
        if (messageText.includes(word.toLowerCase())) {
            try {
                await sock.sendMessage(chatId, { delete: message.key });
                await sock.sendMessage(chatId, {
                    text: `❌ تم حذف الرسالة: تحتوي على كلمة ممنوعة "${word}"`
                });
                return true;
            } catch (error) {
                console.error('خطأ في حذف الرسالة:', error);
            }
            break;
        }
    }
    return false;
}

export default {
    command: 'منع',
    aliases: ['antibadword', 'abw', 'badword', 'antibad', 'كلمات_ممنوعة'],
    category: 'admin',
    description: 'إعداد فلتر منع الكلمات البذيئة لحذف الرسائل التي تحتوي على كلمات غير لائقة',
    usage: '!منع <on|off|add|remove|list>',
    groupOnly: true,
    adminOnly: true,
    
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const match = args.join(' ');
        try {
            await handleAntiBadwordCommand(sock, chatId, message, match);
        } catch (error) {
            console.error('خطأ في أمر منع الكلمات:', error);
            await sock.sendMessage(chatId, {
                text: '❌ *خطأ في معالجة الأمر*\n\nيرجى المحاولة مرة أخرى لاحقاً.'
            }, { quoted: message });
        }
    }
};

export { handleAntiBadwordCommand };
export { checkAntiBadword };