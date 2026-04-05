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
            caption: 'ðŸ“ Ø§Ù„Ù†ØªÙŠØ¬Ø© ÙƒØ¨ÙŠØ±Ø© Ø¬Ø¯Ø§Ù‹ØŒ ØªÙ… Ø¥Ø±Ø³Ø§Ù„Ù‡Ø§ ÙƒÙ…Ù„Ù.',
            ...channelInfo
        }, { quoted: message });
        try { fs.unlinkSync(tmpFile); } catch { }
    } else {
        await sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });
    }
}

export default {
    command: 'ÙƒÙ„Ù…Ø§Øª',
    aliases: ['wordcloud', 'wordfreq', 'topwords', 'wordcount', 'ØªØ­Ù„ÙŠÙ„_ÙƒÙ„Ù…Ø§Øª', 'ØªÙƒØ±Ø§Ø±_ÙƒÙ„Ù…Ø§Øª'],
    category: 'Ù…Ø±Ø§ÙÙ‚',
    description: 'ØªØ­Ù„ÙŠÙ„ Ø§Ù„Ù†Øµ ÙˆØ¹Ø±Ø¶ Ø£ÙƒØ«Ø± 20 ÙƒÙ„Ù…Ø© Ø§Ø³ØªØ®Ø¯Ø§Ù…Ø§Ù‹ Ù…Ø¹ Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª',
    usage: '!ÙƒÙ„Ù…Ø§Øª <Ù†Øµ Ø£Ùˆ Ø±Ø¯ Ø¹Ù„Ù‰ Ø±Ø³Ø§Ù„Ø©>',
    
    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        const scriptPath = path.join(process.cwd(), 'lib', 'wordcloud.py');
        
        if (!fs.existsSync(scriptPath)) {
            return await sock.sendMessage(chatId, {
                text: `âŒ Ù…Ù„Ù wordcloud.py ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯ ÙÙŠ Ù…Ø¬Ù„Ø¯ lib/.`,
                ...channelInfo
            }, { quoted: message });
        }
        
        const quoted = getQuoted(message);
        const quotedText = quoted?.conversation || quoted?.extendedTextMessage?.text || '';
        const hasDoc = !!quoted?.documentMessage;
        const textInput = args.join(' ').trim() || quotedText;
        
        if (!textInput && !hasDoc) {
            return await sock.sendMessage(chatId, {
                text: `ðŸ“ *ØªØ­Ù„ÙŠÙ„ Ø§Ù„ÙƒÙ„Ù…Ø§Øª*\n\n` +
                    `*Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…:*\n` +
                    `\`!ÙƒÙ„Ù…Ø§Øª <Ø£ÙŠ Ù†Øµ>\`\n\n` +
                    `*Ø£Ùˆ Ø±Ø¯ Ø¹Ù„Ù‰:*\n` +
                    `â€¢ Ø£ÙŠ Ø±Ø³Ø§Ù„Ø© Ù†ØµÙŠØ©\n` +
                    `â€¢ Ù…Ù„Ù .txt\n\n` +
                    `*Ø§Ù„Ù†ØªØ§Ø¦Ø¬ ØªØ´Ù…Ù„:*\n` +
                    `ðŸ“Š Ø¹Ø¯Ø¯ Ø§Ù„ÙƒÙ„Ù…Ø§Øª ÙˆØ§Ù„Ø¬Ù…Ù„\n` +
                    `ðŸ† Ø£ÙƒØ«Ø± 20 ÙƒÙ„Ù…Ø© Ø§Ø³ØªØ®Ø¯Ø§Ù…Ø§Ù‹\n` +
                    `â±ï¸ ÙˆÙ‚Øª Ø§Ù„Ù‚Ø±Ø§Ø¡Ø© Ø§Ù„Ù…Ù‚Ø¯Ø±\n` +
                    `ðŸ“– ØªÙ†ÙˆØ¹ Ø§Ù„Ù…ÙØ±Ø¯Ø§Øª`,
                ...channelInfo
            }, { quoted: message });
        }
        
        await sock.sendMessage(chatId, { text: 'ðŸ” Ø¬Ø§Ø±ÙŠ ØªØ­Ù„ÙŠÙ„ Ø§Ù„Ù†Øµ...', ...channelInfo }, { quoted: message });
        
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
                    return await sock.sendMessage(chatId, { text: `âŒ ${data.error}`, ...channelInfo }, { quoted: message });
                }
                await sendResult(sock, chatId, channelInfo, message, formatResult(data), `ØªØ­Ù„ÙŠÙ„_ÙƒÙ„Ù…Ø§Øª_${id}.txt`);
            } else {
                const tmpFile = path.join(tempDir, `wc_in_${id}.txt`);
                fs.writeFileSync(tmpFile, textInput);
                cmd = `python3 "${scriptPath}" --file "${tmpFile}"`;
                const { stdout } = await execAsync(cmd, { timeout: 30000 });
                try { fs.unlinkSync(tmpFile); } catch { }
                
                const data = JSON.parse(stdout.trim());
                if (data.error) {
                    return await sock.sendMessage(chatId, { text: `âŒ ${data.error}`, ...channelInfo }, { quoted: message });
                }
                await sendResult(sock, chatId, channelInfo, message, formatResult(data), `ØªØ­Ù„ÙŠÙ„_ÙƒÙ„Ù…Ø§Øª_${id}.txt`);
            }
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `âŒ ÙØ´Ù„ Ø§Ù„ØªØ­Ù„ÙŠÙ„: ${error.message}`,
                ...channelInfo
            }, { quoted: message });
        }
    }
};

function formatResult(d) {
    const bar = (count, max) => {
        const filled = Math.round((count / max) * 10);
        return 'â–ˆ'.repeat(filled) + 'â–‘'.repeat(10 - filled);
    };
    
    const maxCount = d.top_words?.[0]?.count || 1;
    let topWordsText = '';
    
    if (d.top_words?.length) {
        topWordsText = d.top_words.map((w, i) => 
            `${String(i + 1).padStart(2, ' ')}. ${w.word.padEnd(15)} ${bar(w.count, maxCount)} ${w.count}x`
        ).join('\n');
    }
    
    return `ðŸ“ *ØªØ­Ù„ÙŠÙ„ Ø§Ù„ÙƒÙ„Ù…Ø§Øª*\n\n` +
        `â”â”â”â”â”â” ðŸ“Š Ø§Ù„Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª â”â”â”â”â”â”\n` +
        `ðŸ“– *Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„ÙƒÙ„Ù…Ø§Øª:* ${d.total_words?.toLocaleString()}\n` +
        `ðŸ”¤ *Ø§Ù„ÙƒÙ„Ù…Ø§Øª Ø§Ù„ÙØ±ÙŠØ¯Ø©:* ${d.unique_words?.toLocaleString()}\n` +
        `ðŸ“ *Ø§Ù„Ø­Ø±ÙˆÙ:* ${d.total_chars?.toLocaleString()}\n` +
        `ðŸ“œ *Ø§Ù„Ø¬Ù…Ù„:* ${d.sentences}\n` +
        `ðŸ“„ *Ø§Ù„ÙÙ‚Ø±Ø§Øª:* ${d.paragraphs}\n` +
        `â±ï¸ *ÙˆÙ‚Øª Ø§Ù„Ù‚Ø±Ø§Ø¡Ø©:* ${d.reading_time}\n` +
        `ðŸŽ¯ *ØªÙ†ÙˆØ¹ Ø§Ù„Ù…ÙØ±Ø¯Ø§Øª:* ${d.lexical_diversity}%\n` +
        `ðŸ“ *Ù…ØªÙˆØ³Ø· Ø·ÙˆÙ„ Ø§Ù„ÙƒÙ„Ù…Ø©:* ${d.avg_word_len} Ø­Ø±ÙˆÙ\n\n` +
        `â”â”â”â”â”â” ðŸ† Ø£ÙƒØ«Ø± Ø§Ù„ÙƒÙ„Ù…Ø§Øª Ø§Ø³ØªØ®Ø¯Ø§Ù…Ø§Ù‹ â”â”â”â”â”â”\n` +
        `\`\`\`\n${topWordsText}\n\`\`\`\n\n` +
        `ðŸ”¥ *Crazy Seif BOT* | ðŸ“ž 01144534147`;
}

