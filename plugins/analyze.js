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
            caption: 'ðŸ“ˆ Ø§Ù„Ù†ØªÙŠØ¬Ø© ÙƒØ¨ÙŠØ±Ø© Ø¬Ø¯Ø§Ù‹ØŒ ØªÙ… Ø¥Ø±Ø³Ø§Ù„Ù‡Ø§ ÙƒÙ…Ù„Ù.',
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
    command: 'ØªØ­Ù„ÙŠÙ„',
    aliases: ['analyze', 'textanalyze', 'textanalyser', 'analyse', 'readability', 'Ø­Ù„Ù„'],
    category: 'Ù…Ø±Ø§ÙÙ‚',
    description: 'ØªØ­Ù„ÙŠÙ„ Ø¹Ù…ÙŠÙ‚ Ù„Ù„Ù†Øµ: Ù…Ø³ØªÙˆÙ‰ Ø§Ù„Ù‚Ø±Ø§Ø¡Ø©ØŒ Ø§Ù„Ù…Ø´Ø§Ø¹Ø±ØŒ Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª Ø§Ù„ÙƒÙ„Ù…Ø§Øª',
    usage: '!ØªØ­Ù„ÙŠÙ„ <Ù†Øµ Ø£Ùˆ Ø±Ø¯ Ø¹Ù„Ù‰ Ø±Ø³Ø§Ù„Ø©>',
    
    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        const binPath = getBin('analyze');
        
        if (!fs.existsSync(binPath)) {
            return await sock.sendMessage(chatId, {
                text: `âŒ Ø£Ø¯Ø§Ø© Ø§Ù„ØªØ­Ù„ÙŠÙ„ ØºÙŠØ± Ù…ØªÙˆÙØ±Ø© Ø¹Ù„Ù‰ Ù‡Ø°Ø§ Ø§Ù„Ø®Ø§Ø¯Ù….`,
                ...channelInfo
            }, { quoted: message });
        }
        
        const quoted = getQuoted(message);
        const quotedText = quoted?.conversation || quoted?.extendedTextMessage?.text || '';
        const hasDoc = !!quoted?.documentMessage;
        const textInput = args.join(' ').trim() || quotedText;
        
        if (!textInput && !hasDoc) {
            return await sock.sendMessage(chatId, {
                text: `ðŸ“ˆ *Ù…Ø­Ù„Ù„ Ø§Ù„Ù†ØµÙˆØµ*\n\n` +
                    `*Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…:* \`!ØªØ­Ù„ÙŠÙ„ <Ø£ÙŠ Ù†Øµ>\`\n\n` +
                    `*Ø£Ùˆ Ø±Ø¯ Ø¹Ù„Ù‰:*\n` +
                    `â€¢ Ø£ÙŠ Ø±Ø³Ø§Ù„Ø© Ù†ØµÙŠØ©\n` +
                    `â€¢ Ù…Ù„Ù .txt\n\n` +
                    `*Ø§Ù„Ù†ØªØ§Ø¦Ø¬ ØªØ´Ù…Ù„:*\n` +
                    `ðŸ“Š Ø¹Ø¯Ø¯ Ø§Ù„ÙƒÙ„Ù…Ø§Øª/Ø§Ù„Ø¬Ù…Ù„/Ø§Ù„ÙÙ‚Ø±Ø§Øª\n` +
                    `ðŸ“– Ø¯Ø±Ø¬Ø© ÙˆÙ…Ø³ØªÙˆÙ‰ Ø³Ù‡ÙˆÙ„Ø© Ø§Ù„Ù‚Ø±Ø§Ø¡Ø©\n` +
                    `ðŸ˜Š ØªØ­Ù„ÙŠÙ„ Ø§Ù„Ù…Ø´Ø§Ø¹Ø± (Ø¥ÙŠØ¬Ø§Ø¨ÙŠ/Ø³Ù„Ø¨ÙŠ/Ù…Ø­Ø§ÙŠØ¯)\n` +
                    `â±ï¸ ÙˆÙ‚Øª Ø§Ù„Ù‚Ø±Ø§Ø¡Ø© Ø§Ù„Ù…Ù‚Ø¯Ø±\n` +
                    `ðŸ† Ø£Ù‡Ù… 20 ÙƒÙ„Ù…Ø© Ù…ÙØªØ§Ø­ÙŠØ©`,
                ...channelInfo
            }, { quoted: message });
        }
        
        await sock.sendMessage(chatId, { text: 'ðŸ” Ø¬Ø§Ø±ÙŠ Ø§Ù„ØªØ­Ù„ÙŠÙ„...', ...channelInfo }, { quoted: message });
        
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
                return 'â–ˆ'.repeat(filled) + 'â–‘'.repeat(10 - filled);
            };
            
            const fleschBar = bar(data.flesch_score / 10);
            const sentBar = data.sentiment_score >= 0
                ? 'ðŸŸ¢'.repeat(Math.min(5, Math.round(data.sentiment_score / 20)))
                : 'ðŸ”´'.repeat(Math.min(5, Math.round(Math.abs(data.sentiment_score) / 20)));
            
            const topWordsText = data.top_words?.length
                ? data.top_words.slice(0, 15).map((w, i) => `${String(i + 1).padStart(2)}. ${w.word.padEnd(15)} ${w.count}x`).join('\n')
                : 'Ù„Ø§ ÙŠÙˆØ¬Ø¯';
            
            const resultText = `ðŸ“ˆ *ØªÙ‚Ø±ÙŠØ± ØªØ­Ù„ÙŠÙ„ Ø§Ù„Ù†Øµ*\n\n` +
                `â”â”â”â”â”â” ðŸ“Š Ø§Ù„Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª â”â”â”â”â”â”\n` +
                `ðŸ“– *Ø§Ù„ÙƒÙ„Ù…Ø§Øª:* ${data.total_words?.toLocaleString()} (${data.unique_words?.toLocaleString()} ÙØ±ÙŠØ¯Ø©)\n` +
                `ðŸ“ *Ø§Ù„Ø­Ø±ÙˆÙ:* ${data.total_chars?.toLocaleString()} (${data.chars_no_spaces?.toLocaleString()} Ø¨Ø¯ÙˆÙ† Ù…Ø³Ø§ÙØ§Øª)\n` +
                `ðŸ“œ *Ø§Ù„Ø¬Ù…Ù„:* ${data.sentences}\n` +
                `ðŸ“„ *Ø§Ù„ÙÙ‚Ø±Ø§Øª:* ${data.paragraphs}\n` +
                `ðŸ”¤ *Ø§Ù„Ù…Ù‚Ø§Ø·Ø¹:* ${data.syllables?.toLocaleString()}\n` +
                `ðŸ“ *Ù…ØªÙˆØ³Ø· Ø·ÙˆÙ„ Ø§Ù„ÙƒÙ„Ù…Ø©:* ${data.avg_word_length} Ø­Ø±ÙˆÙ\n` +
                `ðŸ“ *Ù…ØªÙˆØ³Ø· Ø·ÙˆÙ„ Ø§Ù„Ø¬Ù…Ù„Ø©:* ${data.avg_sentence_length} ÙƒÙ„Ù…Ø§Øª\n` +
                `ðŸ”  *Ø§Ù„ÙƒÙ„Ù…Ø§Øª Ø§Ù„Ù…Ø¹Ù‚Ø¯Ø©:* ${data.long_words}\n\n` +
                `â”â”â”â”â”â” ðŸ“– Ø³Ù‡ÙˆÙ„Ø© Ø§Ù„Ù‚Ø±Ø§Ø¡Ø© â”â”â”â”â”â”\n` +
                `ðŸ“Š *Ø¯Ø±Ø¬Ø© Flesch:* ${data.flesch_score}/100\n` +
                `${fleschBar}\n` +
                `ðŸŽ“ *Ù…Ø³ØªÙˆÙ‰ Ø§Ù„Ù‚Ø±Ø§Ø¡Ø©:* ${data.reading_level}\n` +
                `â±ï¸ *ÙˆÙ‚Øª Ø§Ù„Ù‚Ø±Ø§Ø¡Ø©:* ${data.reading_time}\n\n` +
                `â”â”â”â”â”â” ðŸ˜Š ØªØ­Ù„ÙŠÙ„ Ø§Ù„Ù…Ø´Ø§Ø¹Ø± â”â”â”â”â”â”\n` +
                `${sentBar || 'â¬œâ¬œâ¬œâ¬œâ¬œ'}\n` +
                `ðŸŽ­ *Ø§Ù„Ù†ØªÙŠØ¬Ø©:* ${data.sentiment}\n` +
                `âœ… *ÙƒÙ„Ù…Ø§Øª Ø¥ÙŠØ¬Ø§Ø¨ÙŠØ©:* ${data.positive_words}\n` +
                `âŒ *ÙƒÙ„Ù…Ø§Øª Ø³Ù„Ø¨ÙŠØ©:* ${data.negative_words}\n\n` +
                `â”â”â”â”â”â” ðŸ† Ø£Ù‡Ù… Ø§Ù„ÙƒÙ„Ù…Ø§Øª â”â”â”â”â”â”\n` +
                `\`\`\`\n${topWordsText}\n\`\`\``;
            
            await sendResult(sock, chatId, channelInfo, message, resultText, `ØªØ­Ù„ÙŠÙ„_${id}.txt`);
            
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `âŒ ÙØ´Ù„ Ø§Ù„ØªØ­Ù„ÙŠÙ„: ${error.message}`,
                ...channelInfo
            }, { quoted: message });
        }
    }
};

