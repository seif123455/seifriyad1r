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
            caption: 'ðŸŒ Ø§Ù„Ù†ØªÙŠØ¬Ø© ÙƒØ¨ÙŠØ±Ø© Ø¬Ø¯Ø§Ù‹ØŒ ØªÙ… Ø¥Ø±Ø³Ø§Ù„Ù‡Ø§ ÙƒÙ…Ù„Ù.',
            ...channelInfo
        }, { quoted: message });
        try { fs.unlinkSync(tmpFile); } catch { }
    } else {
        await sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });
    }
}

export default {
    command: 'Ø±Ø§Ø¨Ø·',
    aliases: ['urldecode', 'urlencode', 'urlextract', 'links', 'extractlinks', 'ÙÙƒ_Ø±Ø§Ø¨Ø·', 'ØªØ±Ù…ÙŠØ²_Ø±Ø§Ø¨Ø·'],
    category: 'Ù…Ø±Ø§ÙÙ‚',
    description: 'ÙÙƒ/ØªØ±Ù…ÙŠØ² Ø§Ù„Ø±ÙˆØ§Ø¨Ø· Ø£Ùˆ Ø§Ø³ØªØ®Ø±Ø§Ø¬ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø±ÙˆØ§Ø¨Ø· Ù…Ù† Ø§Ù„Ù†Øµ/Ø§Ù„Ù…Ù„ÙØ§Øª',
    usage: '!Ø±Ø§Ø¨Ø· ÙÙƒ <Ø±Ø§Ø¨Ø·>\Ù†!Ø±Ø§Ø¨Ø· ØªØ±Ù…ÙŠØ² <Ù†Øµ>\Ù†!Ø±Ø§Ø¨Ø· Ø§Ø³ØªØ®Ø±Ø§Ø¬ <Ù†Øµ Ø£Ùˆ Ø±Ø¯ Ø¹Ù„Ù‰ Ù…Ù„Ù>',
    
    async handler(sock, message, args, context) {
        const { chatId, channelInfo, userMessage } = context;
        const scriptPath = path.join(process.cwd(), 'lib', 'urltool.py');
        
        if (!fs.existsSync(scriptPath)) {
            return await sock.sendMessage(chatId, {
                text: `âŒ Ù…Ù„Ù urltool.py ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯ ÙÙŠ Ù…Ø¬Ù„Ø¯ lib/.`,
                ...channelInfo
            }, { quoted: message });
        }
        
        const quoted = getQuoted(message);
        const quotedText = quoted?.conversation || quoted?.extendedTextMessage?.text || '';
        const hasDoc = !!quoted?.documentMessage;
        
        // ÙƒØ´Ù Ø§Ù„ÙˆØ¶Ø¹ Ù…Ù† Ø§Ù„Ø£Ù…Ø± Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…
        let mode = 'decode';
        
        if (userMessage.startsWith('ØªØ±Ù…ÙŠØ²') || userMessage.startsWith('urlencode') ||
            userMessage.startsWith('/ØªØ±Ù…ÙŠØ²') || userMessage.startsWith('!ØªØ±Ù…ÙŠØ²')) {
            mode = 'encode';
        } else if (userMessage.startsWith('Ø§Ø³ØªØ®Ø±Ø§Ø¬') || userMessage.startsWith('extractlinks') ||
            userMessage.startsWith('/Ø§Ø³ØªØ®Ø±Ø§Ø¬') || userMessage.startsWith('!Ø§Ø³ØªØ®Ø±Ø§Ø¬') ||
            userMessage.startsWith('links')) {
            mode = 'extract';
        } else if (args[0]?.toLowerCase() === 'ØªØ±Ù…ÙŠØ²' || args[0]?.toLowerCase() === 'encode') {
            mode = 'encode';
            args = args.slice(1);
        } else if (args[0]?.toLowerCase() === 'Ø§Ø³ØªØ®Ø±Ø§Ø¬' || args[0]?.toLowerCase() === 'extract' || 
                   args[0]?.toLowerCase() === 'links') {
            mode = 'extract';
            args = args.slice(1);
        } else if (args[0]?.toLowerCase() === 'ÙÙƒ' || args[0]?.toLowerCase() === 'decode') {
            mode = 'decode';
            args = args.slice(1);
        }
        
        const textInput = args.join(' ').trim() || quotedText;
        
        if (!textInput && !hasDoc) {
            return await sock.sendMessage(chatId, {
                text: `ðŸŒ *Ø£Ø¯ÙˆØ§Øª Ø§Ù„Ø±ÙˆØ§Ø¨Ø·*\n\n` +
                    `*ÙÙƒ ØªØ±Ù…ÙŠØ² Ø±Ø§Ø¨Ø·:*\n` +
                    `\`!Ø±Ø§Ø¨Ø· ÙÙƒ https://example.com/path%20with%20spaces\`\n\n` +
                    `*ØªØ±Ù…ÙŠØ² Ù†Øµ Ø¥Ù„Ù‰ Ø±Ø§Ø¨Ø·:*\n` +
                    `\`!Ø±Ø§Ø¨Ø· ØªØ±Ù…ÙŠØ² Ù…Ø±Ø­Ø¨Ø§ Ø¨Ø§Ù„Ø¹Ø§Ù„Ù…\`\n\n` +
                    `*Ø§Ø³ØªØ®Ø±Ø§Ø¬ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø±ÙˆØ§Ø¨Ø· Ù…Ù† Ø§Ù„Ù†Øµ:*\n` +
                    `\`!Ø±Ø§Ø¨Ø· Ø§Ø³ØªØ®Ø±Ø§Ø¬ <Ù†Øµ>\`\n` +
                    `Ø£Ùˆ Ø±Ø¯ Ø¹Ù„Ù‰ Ø£ÙŠ Ø±Ø³Ø§Ù„Ø© Ù†ØµÙŠØ© Ø£Ùˆ Ù…Ù„Ù Ø¨Ù€ \`!Ø±Ø§Ø¨Ø· Ø§Ø³ØªØ®Ø±Ø§Ø¬\``,
                ...channelInfo
            }, { quoted: message });
        }
        
        const tempDir = path.join(process.cwd(), 'temp');
        fs.mkdirSync(tempDir, { recursive: true });
        const id = Date.now();
        
        try {
            let stdout;
            
            if (hasDoc && quoted && mode === 'extract') {
                await sock.sendMessage(chatId, { text: 'â³ Ø¬Ø§Ø±ÙŠ Ù‚Ø±Ø§Ø¡Ø© Ø§Ù„Ù…Ù„Ù...', ...channelInfo }, { quoted: message });
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
                return await sock.sendMessage(chatId, { text: `âŒ ${data.error}`, ...channelInfo }, { quoted: message });
            }
            
            let resultText = '';
            
            if (mode === 'decode') {
                resultText = `ðŸŒ *ÙÙƒ ØªØ±Ù…ÙŠØ² Ø§Ù„Ø±Ø§Ø¨Ø·*\n\n` +
                    `ðŸ“¥ *Ø§Ù„Ø£ØµÙ„ÙŠ:*\n\`${data.original}\`\n\n` +
                    `ðŸ“¤ *Ø¨Ø¹Ø¯ Ø§Ù„ÙÙƒ:*\n\`${data.decoded}\``;
                if (data.scheme) resultText += `\n\nðŸ” *ØªÙØ§ØµÙŠÙ„:*\nâ€¢ Ø§Ù„Ù†ÙˆØ¹: ${data.scheme}\nâ€¢ Ø§Ù„Ù…Ø¶ÙŠÙ: ${data.host}\nâ€¢ Ø§Ù„Ù…Ø³Ø§Ø±: ${data.path}`;
                if (data.query_params) {
                    const params = Object.entries(data.query_params).map(([k, v]) => `  â€¢ ${k}: ${v}`).join('\n');
                    resultText += `\nâ€¢ Ø§Ù„Ù…Ø¹Ø§Ù…Ù„Ø§Øª:\n${params}`;
                }
                if (data.fragment) resultText += `\nâ€¢ Ø§Ù„Ø¬Ø²Ø¡: ${data.fragment}`;
                
            } else if (mode === 'encode') {
                resultText = `ðŸŒ *ØªØ±Ù…ÙŠØ² Ø§Ù„Ø±Ø§Ø¨Ø·*\n\n` +
                    `ðŸ“¥ *Ø§Ù„Ø£ØµÙ„ÙŠ:*\n\`${data.original}\`\n\n` +
                    `ðŸ”’ *Ø¨Ø¹Ø¯ Ø§Ù„ØªØ±Ù…ÙŠØ² Ø§Ù„ÙƒØ§Ù…Ù„:*\n\`${data.fully_encoded}\`\n\n` +
                    `ðŸ”“ *Ø¨Ø¹Ø¯ Ø§Ù„ØªØ±Ù…ÙŠØ² Ø§Ù„Ø¢Ù…Ù†:*\n\`${data.safe_encoded}\``;
                    
            } else {
                // Ø§Ø³ØªØ®Ø±Ø§Ø¬
                if (data.total === 0) {
                    resultText = `ðŸŒ *Ù…Ø³ØªØ®Ø±Ø¬ Ø§Ù„Ø±ÙˆØ§Ø¨Ø·*\n\nâŒ Ù„Ù… ÙŠØªÙ… Ø§Ù„Ø¹Ø«ÙˆØ± Ø¹Ù„Ù‰ Ø±ÙˆØ§Ø¨Ø· ÙÙŠ Ø§Ù„Ù†Øµ.`;
                } else {
                    const lines = [`ðŸŒ *Ù…Ø³ØªØ®Ø±Ø¬ Ø§Ù„Ø±ÙˆØ§Ø¨Ø· â€” ØªÙ… Ø§Ù„Ø¹Ø«ÙˆØ± Ø¹Ù„Ù‰ ${data.total} Ø±Ø§Ø¨Ø·*\n`];
                    if (data.social?.length) {
                        lines.push(`ðŸ“± *Ù…ÙˆØ§Ù‚Ø¹ ØªÙˆØ§ØµÙ„ (${data.social.length}):*`);
                        data.social.forEach((u) => lines.push(`â€¢ ${u}`));
                        lines.push('');
                    }
                    if (data.media?.length) {
                        lines.push(`ðŸ–¼ï¸ *ÙˆØ³Ø§Ø¦Ø· (${data.media.length}):*`);
                        data.media.forEach((u) => lines.push(`â€¢ ${u}`));
                        lines.push('');
                    }
                    if (data.documents?.length) {
                        lines.push(`ðŸ“„ *Ù…Ø³ØªÙ†Ø¯Ø§Øª (${data.documents.length}):*`);
                        data.documents.forEach((u) => lines.push(`â€¢ ${u}`));
                        lines.push('');
                    }
                    if (data.other?.length) {
                        lines.push(`ðŸ”— *Ø±ÙˆØ§Ø¨Ø· Ø£Ø®Ø±Ù‰ (${data.other.length}):*`);
                        data.other.forEach((u) => lines.push(`â€¢ ${u}`));
                    }
                    resultText = lines.join('\n');
                }
            }
            
            resultText += `\n\nðŸ”¥ *Crazy Seif BOT* | ðŸ“ž 01144534147`;
            await sendResult(sock, chatId, channelInfo, message, resultText, `Ø±ÙˆØ§Ø¨Ø·_${id}.txt`);
            
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `âŒ ÙØ´Ù„: ${error.message}`,
                ...channelInfo
            }, { quoted: message });
        }
    }
};

