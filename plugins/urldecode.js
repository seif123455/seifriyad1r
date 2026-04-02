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
            caption: '🌐 النتيجة كبيرة جداً، تم إرسالها كملف.',
            ...channelInfo
        }, { quoted: message });
        try { fs.unlinkSync(tmpFile); } catch { }
    } else {
        await sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });
    }
}

export default {
    command: 'رابط',
    aliases: ['urldecode', 'urlencode', 'urlextract', 'links', 'extractlinks', 'فك_رابط', 'ترميز_رابط'],
    category: 'utility',
    description: 'فك/ترميز الروابط أو استخراج جميع الروابط من النص/الملفات',
    usage: '!رابط فك <رابط>\n!رابط ترميز <نص>\n!رابط استخراج <نص أو رد على ملف>',
    
    async handler(sock, message, args, context) {
        const { chatId, channelInfo, userMessage } = context;
        const scriptPath = path.join(process.cwd(), 'lib', 'urltool.py');
        
        if (!fs.existsSync(scriptPath)) {
            return await sock.sendMessage(chatId, {
                text: `❌ ملف urltool.py غير موجود في مجلد lib/.`,
                ...channelInfo
            }, { quoted: message });
        }
        
        const quoted = getQuoted(message);
        const quotedText = quoted?.conversation || quoted?.extendedTextMessage?.text || '';
        const hasDoc = !!quoted?.documentMessage;
        
        // كشف الوضع من الأمر المستخدم
        let mode = 'decode';
        
        if (userMessage.startsWith('ترميز') || userMessage.startsWith('urlencode') ||
            userMessage.startsWith('/ترميز') || userMessage.startsWith('!ترميز')) {
            mode = 'encode';
        } else if (userMessage.startsWith('استخراج') || userMessage.startsWith('extractlinks') ||
            userMessage.startsWith('/استخراج') || userMessage.startsWith('!استخراج') ||
            userMessage.startsWith('links')) {
            mode = 'extract';
        } else if (args[0]?.toLowerCase() === 'ترميز' || args[0]?.toLowerCase() === 'encode') {
            mode = 'encode';
            args = args.slice(1);
        } else if (args[0]?.toLowerCase() === 'استخراج' || args[0]?.toLowerCase() === 'extract' || 
                   args[0]?.toLowerCase() === 'links') {
            mode = 'extract';
            args = args.slice(1);
        } else if (args[0]?.toLowerCase() === 'فك' || args[0]?.toLowerCase() === 'decode') {
            mode = 'decode';
            args = args.slice(1);
        }
        
        const textInput = args.join(' ').trim() || quotedText;
        
        if (!textInput && !hasDoc) {
            return await sock.sendMessage(chatId, {
                text: `🌐 *أدوات الروابط*\n\n` +
                    `*فك ترميز رابط:*\n` +
                    `\`!رابط فك https://example.com/path%20with%20spaces\`\n\n` +
                    `*ترميز نص إلى رابط:*\n` +
                    `\`!رابط ترميز مرحبا بالعالم\`\n\n` +
                    `*استخراج جميع الروابط من النص:*\n` +
                    `\`!رابط استخراج <نص>\`\n` +
                    `أو رد على أي رسالة نصية أو ملف بـ \`!رابط استخراج\``,
                ...channelInfo
            }, { quoted: message });
        }
        
        const tempDir = path.join(process.cwd(), 'temp');
        fs.mkdirSync(tempDir, { recursive: true });
        const id = Date.now();
        
        try {
            let stdout;
            
            if (hasDoc && quoted && mode === 'extract') {
                await sock.sendMessage(chatId, { text: '⏳ جاري قراءة الملف...', ...channelInfo }, { quoted: message });
                const msgObj = { message: { documentMessage: quoted.documentMessage } };
                const buf = await downloadMediaMessage(msgObj, 'buffer', {});
                const tmpFile = path.join(tempDir, `url_in_${id}.txt`);
                fs.writeFileSync(tmpFile, buf);
                const result = await execAsync(`python3 "${scriptPath}" extract --file "${tmpFile}"`, { timeout: 30000 });
                stdout = result.stdout;
                try { fs.unlinkSync(tmpFile); } catch { }
            } else {
                const safeText = textInput.replace(/'/g, "'\"'\"'");
                const result = await execAsync(`python3 "${scriptPath}" ${mode === 'decode' ? 'decode' : mode === 'encode' ? 'encode' : 'extract'} '${safeText}'`, { timeout: 30000 });
                stdout = result.stdout;
            }
            
            const data = JSON.parse(stdout.trim());
            
            if (data.error) {
                return await sock.sendMessage(chatId, { text: `❌ ${data.error}`, ...channelInfo }, { quoted: message });
            }
            
            let resultText = '';
            
            if (mode === 'decode') {
                resultText = `🌐 *فك ترميز الرابط*\n\n` +
                    `📥 *الأصلي:*\n\`${data.original}\`\n\n` +
                    `📤 *بعد الفك:*\n\`${data.decoded}\``;
                if (data.scheme) resultText += `\n\n🔍 *تفاصيل:*\n• النوع: ${data.scheme}\n• المضيف: ${data.host}\n• المسار: ${data.path}`;
                if (data.query_params) {
                    const params = Object.entries(data.query_params).map(([k, v]) => `  • ${k}: ${v}`).join('\n');
                    resultText += `\n• المعاملات:\n${params}`;
                }
                if (data.fragment) resultText += `\n• الجزء: ${data.fragment}`;
                
            } else if (mode === 'encode') {
                resultText = `🌐 *ترميز الرابط*\n\n` +
                    `📥 *الأصلي:*\n\`${data.original}\`\n\n` +
                    `🔒 *بعد الترميز الكامل:*\n\`${data.fully_encoded}\`\n\n` +
                    `🔓 *بعد الترميز الآمن:*\n\`${data.safe_encoded}\``;
                    
            } else {
                // استخراج
                if (data.total === 0) {
                    resultText = `🌐 *مستخرج الروابط*\n\n❌ لم يتم العثور على روابط في النص.`;
                } else {
                    const lines = [`🌐 *مستخرج الروابط — تم العثور على ${data.total} رابط*\n`];
                    if (data.social?.length) {
                        lines.push(`📱 *مواقع تواصل (${data.social.length}):*`);
                        data.social.forEach((u) => lines.push(`• ${u}`));
                        lines.push('');
                    }
                    if (data.media?.length) {
                        lines.push(`🖼️ *وسائط (${data.media.length}):*`);
                        data.media.forEach((u) => lines.push(`• ${u}`));
                        lines.push('');
                    }
                    if (data.documents?.length) {
                        lines.push(`📄 *مستندات (${data.documents.length}):*`);
                        data.documents.forEach((u) => lines.push(`• ${u}`));
                        lines.push('');
                    }
                    if (data.other?.length) {
                        lines.push(`🔗 *روابط أخرى (${data.other.length}):*`);
                        data.other.forEach((u) => lines.push(`• ${u}`));
                    }
                    resultText = lines.join('\n');
                }
            }
            
            resultText += `\n\n🔥 *CRAZY-SEIF BOT* | 📞 201144534147`;
            await sendResult(sock, chatId, channelInfo, message, resultText, `روابط_${id}.txt`);
            
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ فشل: ${error.message}`,
                ...channelInfo
            }, { quoted: message });
        }
    }
};