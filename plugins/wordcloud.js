import { downloadMediaMessage } from '@whiskeysockets/baileys';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);
const WA_LIMIT = 60000;

function getQuoted(message) {
    return message?.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
}

async function sendResult(sock, chatId, channelInfo, message, text, filename) {
    if (text.length > WA_LIMIT) {
        const tmpFile = path.join(process.cwd(), 'temp', filename);
        fs.mkdirSync(path.dirname(tmpFile), { recursive: true });
        fs.writeFileSync(tmpFile, text);
        await sock.sendMessage(chatId, {
            document: fs.readFileSync(tmpFile),
            mimetype: 'text/plain',
            fileName: filename,
            caption: '📝 النتيجة كبيرة جداً، تم إرسالها كملف.',
            ...channelInfo
        }, { quoted: message });
        try { fs.unlinkSync(tmpFile); } catch { }
    } else {
        await sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });
    }
}

export default {
    command: 'كلمات',
    aliases: ['wordcloud', 'wordfreq', 'topwords', 'wordcount', 'تحليل_كلمات', 'تكرار_كلمات'],
    category: 'utility',
    description: 'تحليل النص وعرض أكثر 20 كلمة استخداماً مع إحصائيات',
    usage: '!كلمات <نص أو رد على رسالة>',
    
    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        const scriptPath = path.join(process.cwd(), 'lib', 'wordcloud.py');
        
        if (!fs.existsSync(scriptPath)) {
            return await sock.sendMessage(chatId, {
                text: `❌ ملف wordcloud.py غير موجود في مجلد lib/.`,
                ...channelInfo
            }, { quoted: message });
        }
        
        const quoted = getQuoted(message);
        const quotedText = quoted?.conversation || quoted?.extendedTextMessage?.text || '';
        const hasDoc = !!quoted?.documentMessage;
        const textInput = args.join(' ').trim() || quotedText;
        
        if (!textInput && !hasDoc) {
            return await sock.sendMessage(chatId, {
                text: `📝 *تحليل الكلمات*\n\n` +
                    `*الاستخدام:*\n` +
                    `\`!كلمات <أي نص>\`\n\n` +
                    `*أو رد على:*\n` +
                    `• أي رسالة نصية\n` +
                    `• ملف .txt\n\n` +
                    `*النتائج تشمل:*\n` +
                    `📊 عدد الكلمات والجمل\n` +
                    `🏆 أكثر 20 كلمة استخداماً\n` +
                    `⏱️ وقت القراءة المقدر\n` +
                    `📖 تنوع المفردات`,
                ...channelInfo
            }, { quoted: message });
        }
        
        await sock.sendMessage(chatId, { text: '🔍 جاري تحليل النص...', ...channelInfo }, { quoted: message });
        
        const tempDir = path.join(process.cwd(), 'temp');
        fs.mkdirSync(tempDir, { recursive: true });
        const id = Date.now();
        
        try {
            let cmd;
            
            if (hasDoc && quoted) {
                const msgObj = { message: { documentMessage: quoted.documentMessage } };
                const buf = await downloadMediaMessage(msgObj, 'buffer', {});
                const tmpFile = path.join(tempDir, `wc_in_${id}.txt`);
                fs.writeFileSync(tmpFile, buf);
                cmd = `python3 "${scriptPath}" --file "${tmpFile}"`;
                const { stdout } = await execAsync(cmd, { timeout: 30000 });
                try { fs.unlinkSync(tmpFile); } catch { }
                
                const data = JSON.parse(stdout.trim());
                if (data.error) {
                    return await sock.sendMessage(chatId, { text: `❌ ${data.error}`, ...channelInfo }, { quoted: message });
                }
                await sendResult(sock, chatId, channelInfo, message, formatResult(data), `تحليل_كلمات_${id}.txt`);
            } else {
                const tmpFile = path.join(tempDir, `wc_in_${id}.txt`);
                fs.writeFileSync(tmpFile, textInput);
                cmd = `python3 "${scriptPath}" --file "${tmpFile}"`;
                const { stdout } = await execAsync(cmd, { timeout: 30000 });
                try { fs.unlinkSync(tmpFile); } catch { }
                
                const data = JSON.parse(stdout.trim());
                if (data.error) {
                    return await sock.sendMessage(chatId, { text: `❌ ${data.error}`, ...channelInfo }, { quoted: message });
                }
                await sendResult(sock, chatId, channelInfo, message, formatResult(data), `تحليل_كلمات_${id}.txt`);
            }
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ فشل التحليل: ${error.message}`,
                ...channelInfo
            }, { quoted: message });
        }
    }
};

function formatResult(d) {
    const bar = (count, max) => {
        const filled = Math.round((count / max) * 10);
        return '█'.repeat(filled) + '░'.repeat(10 - filled);
    };
    
    const maxCount = d.top_words?.[0]?.count || 1;
    let topWordsText = '';
    
    if (d.top_words?.length) {
        topWordsText = d.top_words.map((w, i) => 
            `${String(i + 1).padStart(2, ' ')}. ${w.word.padEnd(15)} ${bar(w.count, maxCount)} ${w.count}x`
        ).join('\n');
    }
    
    return `📝 *تحليل الكلمات*\n\n` +
        `━━━━━━ 📊 الإحصائيات ━━━━━━\n` +
        `📖 *إجمالي الكلمات:* ${d.total_words?.toLocaleString()}\n` +
        `🔤 *الكلمات الفريدة:* ${d.unique_words?.toLocaleString()}\n` +
        `📝 *الحروف:* ${d.total_chars?.toLocaleString()}\n` +
        `📜 *الجمل:* ${d.sentences}\n` +
        `📄 *الفقرات:* ${d.paragraphs}\n` +
        `⏱️ *وقت القراءة:* ${d.reading_time}\n` +
        `🎯 *تنوع المفردات:* ${d.lexical_diversity}%\n` +
        `📏 *متوسط طول الكلمة:* ${d.avg_word_len} حروف\n\n` +
        `━━━━━━ 🏆 أكثر الكلمات استخداماً ━━━━━━\n` +
        `\`\`\`\n${topWordsText}\n\`\`\`\n\n` +
        `🔥 *CRAZY-SEIF BOT* | 📞 201144534147`;
}