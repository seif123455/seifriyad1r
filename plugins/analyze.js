import { downloadMediaMessage } from '@whiskeysockets/baileys';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getBin } from '../lib/compile.js';
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
            caption: '📈 النتيجة كبيرة جداً، تم إرسالها كملف.',
            ...channelInfo
        }, { quoted: message });
        try {
            fs.unlinkSync(tmpFile);
        } catch { }
    } else {
        await sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });
    }
}

export default {
    command: 'تحليل',
    aliases: ['analyze', 'textanalyze', 'textanalyser', 'analyse', 'readability', 'حلل'],
    category: 'utility',
    description: 'تحليل عميق للنص: مستوى القراءة، المشاعر، إحصائيات الكلمات',
    usage: '!تحليل <نص أو رد على رسالة>',
    
    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        const binPath = getBin('analyze');
        
        if (!fs.existsSync(binPath)) {
            return await sock.sendMessage(chatId, {
                text: `❌ أداة التحليل غير متوفرة على هذا الخادم.`,
                ...channelInfo
            }, { quoted: message });
        }
        
        const quoted = getQuoted(message);
        const quotedText = quoted?.conversation || quoted?.extendedTextMessage?.text || '';
        const hasDoc = !!quoted?.documentMessage;
        const textInput = args.join(' ').trim() || quotedText;
        
        if (!textInput && !hasDoc) {
            return await sock.sendMessage(chatId, {
                text: `📈 *محلل النصوص*\n\n` +
                    `*الاستخدام:* \`!تحليل <أي نص>\`\n\n` +
                    `*أو رد على:*\n` +
                    `• أي رسالة نصية\n` +
                    `• ملف .txt\n\n` +
                    `*النتائج تشمل:*\n` +
                    `📊 عدد الكلمات/الجمل/الفقرات\n` +
                    `📖 درجة ومستوى سهولة القراءة\n` +
                    `😊 تحليل المشاعر (إيجابي/سلبي/محايد)\n` +
                    `⏱️ وقت القراءة المقدر\n` +
                    `🏆 أهم 20 كلمة مفتاحية`,
                ...channelInfo
            }, { quoted: message });
        }
        
        await sock.sendMessage(chatId, { text: '🔍 جاري التحليل...', ...channelInfo }, { quoted: message });
        
        const tempDir = path.join(process.cwd(), 'temp');
        fs.mkdirSync(tempDir, { recursive: true });
        const id = Date.now();
        
        try {
            let stdout;
            
            if (hasDoc && quoted) {
                const msgObj = { message: { documentMessage: quoted.documentMessage } };
                const buf = await downloadMediaMessage(msgObj, 'buffer', {});
                const tmpFile = path.join(tempDir, `analyze_in_${id}.txt`);
                fs.writeFileSync(tmpFile, buf);
                const result = await execAsync(`"${binPath}" --file "${tmpFile}"`, { timeout: 30000 });
                stdout = result.stdout;
                try { fs.unlinkSync(tmpFile); } catch { }
            } else {
                const tmpFile = path.join(tempDir, `analyze_in_${id}.txt`);
                fs.writeFileSync(tmpFile, textInput);
                const result = await execAsync(`"${binPath}" --file "${tmpFile}"`, { timeout: 30000 });
                stdout = result.stdout;
                try { fs.unlinkSync(tmpFile); } catch { }
            }
            
            const data = JSON.parse(stdout.trim());
            
            const bar = (score) => {
                const filled = Math.round(score / 10);
                return '█'.repeat(filled) + '░'.repeat(10 - filled);
            };
            
            const fleschBar = bar(data.flesch_score / 10);
            const sentBar = data.sentiment_score >= 0
                ? '🟢'.repeat(Math.min(5, Math.round(data.sentiment_score / 20)))
                : '🔴'.repeat(Math.min(5, Math.round(Math.abs(data.sentiment_score) / 20)));
            
            const topWordsText = data.top_words?.length
                ? data.top_words.slice(0, 15).map((w, i) => `${String(i + 1).padStart(2)}. ${w.word.padEnd(15)} ${w.count}x`).join('\n')
                : 'لا يوجد';
            
            const resultText = `📈 *تقرير تحليل النص*\n\n` +
                `━━━━━━ 📊 الإحصائيات ━━━━━━\n` +
                `📖 *الكلمات:* ${data.total_words?.toLocaleString()} (${data.unique_words?.toLocaleString()} فريدة)\n` +
                `📝 *الحروف:* ${data.total_chars?.toLocaleString()} (${data.chars_no_spaces?.toLocaleString()} بدون مسافات)\n` +
                `📜 *الجمل:* ${data.sentences}\n` +
                `📄 *الفقرات:* ${data.paragraphs}\n` +
                `🔤 *المقاطع:* ${data.syllables?.toLocaleString()}\n` +
                `📏 *متوسط طول الكلمة:* ${data.avg_word_length} حروف\n` +
                `📐 *متوسط طول الجملة:* ${data.avg_sentence_length} كلمات\n` +
                `🔠 *الكلمات المعقدة:* ${data.long_words}\n\n` +
                `━━━━━━ 📖 سهولة القراءة ━━━━━━\n` +
                `📊 *درجة Flesch:* ${data.flesch_score}/100\n` +
                `${fleschBar}\n` +
                `🎓 *مستوى القراءة:* ${data.reading_level}\n` +
                `⏱️ *وقت القراءة:* ${data.reading_time}\n\n` +
                `━━━━━━ 😊 تحليل المشاعر ━━━━━━\n` +
                `${sentBar || '⬜⬜⬜⬜⬜'}\n` +
                `🎭 *النتيجة:* ${data.sentiment}\n` +
                `✅ *كلمات إيجابية:* ${data.positive_words}\n` +
                `❌ *كلمات سلبية:* ${data.negative_words}\n\n` +
                `━━━━━━ 🏆 أهم الكلمات ━━━━━━\n` +
                `\`\`\`\n${topWordsText}\n\`\`\``;
            
            await sendResult(sock, chatId, channelInfo, message, resultText, `تحليل_${id}.txt`);
            
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ فشل التحليل: ${error.message}`,
                ...channelInfo
            }, { quoted: message });
        }
    }
};