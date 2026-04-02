import { downloadMediaMessage } from '@whiskeysockets/baileys';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

function getQuoted(message) {
    return message?.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
}

function getMediaType(quoted) {
    if (quoted?.imageMessage) return 'صورة';
    if (quoted?.videoMessage) return 'فيديو';
    if (quoted?.audioMessage) return 'صوت';
    if (quoted?.documentMessage) return 'ملف';
    if (quoted?.stickerMessage) return 'ملصق';
    return null;
}

export default {
    command: 'حمض',
    aliases: ['dna', 'dnaencode', 'dnadecode', 'تشفير_حمض', 'فك_حمض'],
    category: 'utility',
    description: 'تشفير أي نص أو وسائط إلى تسلسل DNA (ATCG) أو فك التشفير',
    usage: '!حمض تشفير <نص أو رد على وسائط>\n!حمض فك <حمض أو رد على ملف حمض>',
    
    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        const quoted = getQuoted(message);
        const quotedText = quoted?.conversation || quoted?.extendedTextMessage?.text || '';
        const mediaType = getMediaType(quoted);
        
        if (!args.length) {
            return await sock.sendMessage(chatId, {
                text: `🧬 *تشفير/فك تشفير DNA*\n\n` +
                    `*نص:*\n` +
                    `\`!حمض تشفير مرحبا\`\n` +
                    `\`!حمض فك ATCGATCG...\`\n\n` +
                    `*وسائط (رد على أي ملف):*\n` +
                    `\`!حمض تشفير\` — رد على صورة/فيديو/صوت/ملف\n` +
                    `\`!حمض فك\` — رد على ملف .txt يحتوي على حمض\n\n` +
                    `ℹ️ كل بايت يصبح 4 قواعد DNA (A, T, C, G)`,
                ...channelInfo
            }, { quoted: message });
        }
        
        const mode = args[0]?.toLowerCase();
        
        if (mode !== 'تشفير' && mode !== 'فك' && mode !== 'encode' && mode !== 'decode') {
            return await sock.sendMessage(chatId, {
                text: `❌ استخدم \`تشفير\` أو \`فك\``,
                ...channelInfo
            }, { quoted: message });
        }
        
        // التحقق من وجود الملف الثنائي
        const binPath = path.join(process.cwd(), 'lib', 'bin', 'dna');
        if (!fs.existsSync(binPath)) {
            return await sock.sendMessage(chatId, {
                text: `❌ أداة DNA غير متوفرة على هذا الخادم.`,
                ...channelInfo
            }, { quoted: message });
        }
        
        const tempDir = path.join(process.cwd(), 'temp');
        fs.mkdirSync(tempDir, { recursive: true });
        const id = Date.now();
        
        try {
            const isEncode = (mode === 'تشفير' || mode === 'encode');
            
            if (isEncode) {
                let inputBuffer;
                let sourceLabel;
                
                if (mediaType && quoted) {
                    await sock.sendMessage(chatId, { text: '⏳ جاري تحميل الوسائط...', ...channelInfo }, { quoted: message });
                    const msgObj = { message: { [`${mediaType === 'صورة' ? 'imageMessage' : mediaType === 'فيديو' ? 'videoMessage' : mediaType === 'صوت' ? 'audioMessage' : 'documentMessage'}`]: quoted[`${mediaType === 'صورة' ? 'imageMessage' : mediaType === 'فيديو' ? 'videoMessage' : mediaType === 'صوت' ? 'audioMessage' : 'documentMessage'}`] } };
                    inputBuffer = await downloadMediaMessage(msgObj, 'buffer', {});
                    sourceLabel = `${mediaType} (${inputBuffer.length.toLocaleString()} بايت)`;
                } else {
                    const textInput = args.slice(1).join(' ').trim() || quotedText;
                    if (!textInput) {
                        return await sock.sendMessage(chatId, {
                            text: `❌ لا يوجد نص. أرسل نصاً أو رد على رسالة وسائط.`,
                            ...channelInfo
                        }, { quoted: message });
                    }
                    inputBuffer = Buffer.from(textInput, 'utf8');
                    sourceLabel = `نص (${inputBuffer.length.toLocaleString()} بايت)`;
                }
                
                const inFile = path.join(tempDir, `dna_in_${id}.bin`);
                const outFile = path.join(tempDir, `dna_out_${id}.txt`);
                fs.writeFileSync(inFile, inputBuffer);
                
                await sock.sendMessage(chatId, { text: '🧬 جاري التشفير إلى DNA...', ...channelInfo }, { quoted: message });
                
                const b64 = inputBuffer.toString('base64');
                const b64File = path.join(tempDir, `dna_b64_${id}.txt`);
                fs.writeFileSync(b64File, b64);
                
                const result = await execAsync(`"${binPath}" encode "${b64}"`, { timeout: 30000, maxBuffer: 50 * 1024 * 1024 });
                const dnaResult = result.stdout.trim();
                fs.writeFileSync(outFile, dnaResult);
                
                await sock.sendMessage(chatId, {
                    document: fs.readFileSync(outFile),
                    mimetype: 'text/plain',
                    fileName: `dna_encoded_${id}.txt`,
                    caption: `🧬 *تم تشفير DNA*\n\n` +
                        `📥 *المصدر:* ${sourceLabel}\n` +
                        `📤 *قواعد DNA:* ${dnaResult.length.toLocaleString()}\n\n` +
                        `_رد على هذا الملف بـ \`!حمض فك\` لاستعادته_`,
                    ...channelInfo
                }, { quoted: message });
                
                for (const f of [inFile, outFile, b64File])
                    try { fs.unlinkSync(f); } catch { }
                    
            } else {
                // فك التشفير
                let dnaInput;
                
                if (quoted?.documentMessage) {
                    await sock.sendMessage(chatId, { text: '⏳ جاري قراءة ملف DNA...', ...channelInfo }, { quoted: message });
                    const msgObj = { message: { documentMessage: quoted.documentMessage } };
                    const buf = await downloadMediaMessage(msgObj, 'buffer', {});
                    dnaInput = buf.toString('utf8').trim();
                } else {
                    dnaInput = args.slice(1).join(' ').trim() || quotedText;
                }
                
                if (!dnaInput) {
                    return await sock.sendMessage(chatId, {
                        text: `❌ لا يوجد حمض DNA. أرسل تسلسل DNA أو رد على ملف .txt يحتوي على حمض.`,
                        ...channelInfo
                    }, { quoted: message });
                }
                
                if (!/^[ATCGatcg\s]+$/.test(dnaInput)) {
                    return await sock.sendMessage(chatId, {
                        text: `❌ تسلسل DNA غير صالح. يُسمح فقط بـ A, T, C, G.`,
                        ...channelInfo
                    }, { quoted: message });
                }
                
                const cleanDna = dnaInput.replace(/\s/g, '');
                await sock.sendMessage(chatId, { text: '🔬 جاري فك تشفير DNA...', ...channelInfo }, { quoted: message });
                
                const { stdout, stderr } = await execAsync(`"${binPath}" decode "${cleanDna}"`, { timeout: 30000, maxBuffer: 50 * 1024 * 1024 });
                
                if (stderr && !stdout) {
                    return await sock.sendMessage(chatId, { text: `❌ ${stderr.trim()}`, ...channelInfo }, { quoted: message });
                }
                
                const decoded = stdout.trim();
                const isBase64 = /^[A-Za-z0-9+/]+=*$/.test(decoded) && decoded.length % 4 === 0;
                
                if (isBase64 && decoded.length > 100) {
                    const fileBuffer = Buffer.from(decoded, 'base64');
                    const outFile = path.join(tempDir, `dna_decoded_${id}.bin`);
                    fs.writeFileSync(outFile, fileBuffer);
                    
                    await sock.sendMessage(chatId, {
                        document: fileBuffer,
                        mimetype: 'application/octet-stream',
                        fileName: `dna_decoded_${id}`,
                        caption: `🧬 *تم فك تشفير DNA*\n\n` +
                            `📦 *الملف المستعاد:* ${fileBuffer.length.toLocaleString()} بايت`,
                        ...channelInfo
                    }, { quoted: message });
                    try { fs.unlinkSync(outFile); } catch { }
                } else {
                    if (decoded.length > 800) {
                        const outFile = path.join(tempDir, `dna_decoded_${id}.txt`);
                        fs.writeFileSync(outFile, decoded);
                        await sock.sendMessage(chatId, {
                            document: fs.readFileSync(outFile),
                            mimetype: 'text/plain',
                            fileName: `dna_decoded_${id}.txt`,
                            caption: `🧬 *تم فك تشفير DNA* — ${decoded.length} حرف`,
                            ...channelInfo
                        }, { quoted: message });
                        try { fs.unlinkSync(outFile); } catch { }
                    } else {
                        await sock.sendMessage(chatId, {
                            text: `🧬 *تم فك تشفير DNA*\n\n` +
                                `📤 *النتيجة:*\n\`\`\`\n${decoded}\n\`\`\``,
                            ...channelInfo
                        }, { quoted: message });
                    }
                }
            }
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ فشل: ${error.message}`,
                ...channelInfo
            }, { quoted: message });
        }
    }
};