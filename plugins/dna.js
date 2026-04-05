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
    if (quoted?.imageMessage) return 'ØµÙˆØ±Ø©';
    if (quoted?.videoMessage) return 'ÙÙŠØ¯ÙŠÙˆ';
    if (quoted?.audioMessage) return 'ØµÙˆØª';
    if (quoted?.documentMessage) return 'Ù…Ù„Ù';
    if (quoted?.stickerMessage) return 'Ù…Ù„ØµÙ‚';
    return null;
}

export default {
    command: 'Ø­Ù…Ø¶',
    aliases: ['dna', 'dnaencode', 'dnadecode', 'ØªØ´ÙÙŠØ±_Ø­Ù…Ø¶', 'ÙÙƒ_Ø­Ù…Ø¶'],
    category: 'Ù…Ø±Ø§ÙÙ‚',
    description: 'ØªØ´ÙÙŠØ± Ø£ÙŠ Ù†Øµ Ø£Ùˆ ÙˆØ³Ø§Ø¦Ø· Ø¥Ù„Ù‰ ØªØ³Ù„Ø³Ù„ Ø¯Ù†Ø§ (Ø§ØªÙƒØ¬) Ø£Ùˆ ÙÙƒ Ø§Ù„ØªØ´ÙÙŠØ±',
    usage: '!Ø­Ù…Ø¶ ØªØ´ÙÙŠØ± <Ù†Øµ Ø£Ùˆ Ø±Ø¯ Ø¹Ù„Ù‰ ÙˆØ³Ø§Ø¦Ø·>\Ù†!Ø­Ù…Ø¶ ÙÙƒ <Ø­Ù…Ø¶ Ø£Ùˆ Ø±Ø¯ Ø¹Ù„Ù‰ Ù…Ù„Ù Ø­Ù…Ø¶>',
    
    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        const quoted = getQuoted(message);
        const quotedText = quoted?.conversation || quoted?.extendedTextMessage?.text || '';
        const mediaType = getMediaType(quoted);
        
        if (!args.length) {
            return await sock.sendMessage(chatId, {
                text: `ðŸ§¬ *ØªØ´ÙÙŠØ±/ÙÙƒ ØªØ´ÙÙŠØ± DNA*\n\n` +
                    `*Ù†Øµ:*\n` +
                    `\`!Ø­Ù…Ø¶ ØªØ´ÙÙŠØ± Ù…Ø±Ø­Ø¨Ø§\`\n` +
                    `\`!Ø­Ù…Ø¶ ÙÙƒ ATCGATCG...\`\n\n` +
                    `*ÙˆØ³Ø§Ø¦Ø· (Ø±Ø¯ Ø¹Ù„Ù‰ Ø£ÙŠ Ù…Ù„Ù):*\n` +
                    `\`!Ø­Ù…Ø¶ ØªØ´ÙÙŠØ±\` â€” Ø±Ø¯ Ø¹Ù„Ù‰ ØµÙˆØ±Ø©/ÙÙŠØ¯ÙŠÙˆ/ØµÙˆØª/Ù…Ù„Ù\n` +
                    `\`!Ø­Ù…Ø¶ ÙÙƒ\` â€” Ø±Ø¯ Ø¹Ù„Ù‰ Ù…Ù„Ù .txt ÙŠØ­ØªÙˆÙŠ Ø¹Ù„Ù‰ Ø­Ù…Ø¶\n\n` +
                    `â„¹ï¸ ÙƒÙ„ Ø¨Ø§ÙŠØª ÙŠØµØ¨Ø­ 4 Ù‚ÙˆØ§Ø¹Ø¯ DNA (A, T, C, G)`,
                ...channelInfo
            }, { quoted: message });
        }
        
        const mode = args[0]?.toLowerCase();
        
        if (mode !== 'ØªØ´ÙÙŠØ±' && mode !== 'ÙÙƒ' && mode !== 'encode' && mode !== 'decode') {
            return await sock.sendMessage(chatId, {
                text: `âŒ Ø§Ø³ØªØ®Ø¯Ù… \`ØªØ´ÙÙŠØ±\` Ø£Ùˆ \`ÙÙƒ\``,
                ...channelInfo
            }, { quoted: message });
        }
        
        // Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† ÙˆØ¬ÙˆØ¯ Ø§Ù„Ù…Ù„Ù Ø§Ù„Ø«Ù†Ø§Ø¦ÙŠ
        const binPath = path.join(process.cwd(), 'lib', 'bin', 'dna');
        if (!fs.existsSync(binPath)) {
            return await sock.sendMessage(chatId, {
                text: `âŒ Ø£Ø¯Ø§Ø© DNA ØºÙŠØ± Ù…ØªÙˆÙØ±Ø© Ø¹Ù„Ù‰ Ù‡Ø°Ø§ Ø§Ù„Ø®Ø§Ø¯Ù….`,
                ...channelInfo
            }, { quoted: message });
        }
        
        const tempDir = path.join(process.cwd(), 'temp');
        fs.mkdirSync(tempDir, { recursive: true });
        const id = Date.now();
        
        try {
            const isEncode = (mode === 'ØªØ´ÙÙŠØ±' || mode === 'encode');
            
            if (isEncode) {
                let inputBuffer;
                let sourceLabel;
                
                if (mediaType && quoted) {
                    await sock.sendMessage(chatId, { text: 'â³ Ø¬Ø§Ø±ÙŠ ØªØ­Ù…ÙŠÙ„ Ø§Ù„ÙˆØ³Ø§Ø¦Ø·...', ...channelInfo }, { quoted: message });
                    const msgObj = { message: { [`${mediaType === 'ØµÙˆØ±Ø©' ? 'imageMessage' : mediaType === 'ÙÙŠØ¯ÙŠÙˆ' ? 'videoMessage' : mediaType === 'ØµÙˆØª' ? 'audioMessage' : 'documentMessage'}`]: quoted[`${mediaType === 'ØµÙˆØ±Ø©' ? 'imageMessage' : mediaType === 'ÙÙŠØ¯ÙŠÙˆ' ? 'videoMessage' : mediaType === 'ØµÙˆØª' ? 'audioMessage' : 'documentMessage'}`] } };
                    inputBuffer = await downloadMediaMessage(msgObj, 'buffer', {});
                    sourceLabel = `${mediaType} (${inputBuffer.length.toLocaleString()} Ø¨Ø§ÙŠØª)`;
                } else {
                    const textInput = args.slice(1).join(' ').trim() || quotedText;
                    if (!textInput) {
                        return await sock.sendMessage(chatId, {
                            text: `âŒ Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ù†Øµ. Ø£Ø±Ø³Ù„ Ù†ØµØ§Ù‹ Ø£Ùˆ Ø±Ø¯ Ø¹Ù„Ù‰ Ø±Ø³Ø§Ù„Ø© ÙˆØ³Ø§Ø¦Ø·.`,
                            ...channelInfo
                        }, { quoted: message });
                    }
                    inputBuffer = Buffer.from(textInput, 'utf8');
                    sourceLabel = `Ù†Øµ (${inputBuffer.length.toLocaleString()} Ø¨Ø§ÙŠØª)`;
                }
                
                const inFile = path.join(tempDir, `dna_in_${id}.bin`);
                const outFile = path.join(tempDir, `dna_out_${id}.txt`);
                fs.writeFileSync(inFile, inputBuffer);
                
                await sock.sendMessage(chatId, { text: 'ðŸ§¬ Ø¬Ø§Ø±ÙŠ Ø§Ù„ØªØ´ÙÙŠØ± Ø¥Ù„Ù‰ DNA...', ...channelInfo }, { quoted: message });
                
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
                    caption: `ðŸ§¬ *ØªÙ… ØªØ´ÙÙŠØ± DNA*\n\n` +
                        `ðŸ“¥ *Ø§Ù„Ù…ØµØ¯Ø±:* ${sourceLabel}\n` +
                        `ðŸ“¤ *Ù‚ÙˆØ§Ø¹Ø¯ DNA:* ${dnaResult.length.toLocaleString()}\n\n` +
                        `_Ø±Ø¯ Ø¹Ù„Ù‰ Ù‡Ø°Ø§ Ø§Ù„Ù…Ù„Ù Ø¨Ù€ \`!Ø­Ù…Ø¶ ÙÙƒ\` Ù„Ø§Ø³ØªØ¹Ø§Ø¯ØªÙ‡_`,
                    ...channelInfo
                }, { quoted: message });
                
                for (const f of [inFile, outFile, b64File])
                    try { fs.unlinkSync(f); } catch { }
                    
            } else {
                // ÙÙƒ Ø§Ù„ØªØ´ÙÙŠØ±
                let dnaInput;
                
                if (quoted?.documentMessage) {
                    await sock.sendMessage(chatId, { text: 'â³ Ø¬Ø§Ø±ÙŠ Ù‚Ø±Ø§Ø¡Ø© Ù…Ù„Ù DNA...', ...channelInfo }, { quoted: message });
                    const msgObj = { message: { documentMessage: quoted.documentMessage } };
                    const buf = await downloadMediaMessage(msgObj, 'buffer', {});
                    dnaInput = buf.toString('utf8').trim();
                } else {
                    dnaInput = args.slice(1).join(' ').trim() || quotedText;
                }
                
                if (!dnaInput) {
                    return await sock.sendMessage(chatId, {
                        text: `âŒ Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ø­Ù…Ø¶ DNA. Ø£Ø±Ø³Ù„ ØªØ³Ù„Ø³Ù„ DNA Ø£Ùˆ Ø±Ø¯ Ø¹Ù„Ù‰ Ù…Ù„Ù .txt ÙŠØ­ØªÙˆÙŠ Ø¹Ù„Ù‰ Ø­Ù…Ø¶.`,
                        ...channelInfo
                    }, { quoted: message });
                }
                
                if (!/^[ATCGatcg\s]+$/.test(dnaInput)) {
                    return await sock.sendMessage(chatId, {
                        text: `âŒ ØªØ³Ù„Ø³Ù„ DNA ØºÙŠØ± ØµØ§Ù„Ø­. ÙŠÙØ³Ù…Ø­ ÙÙ‚Ø· Ø¨Ù€ A, T, C, G.`,
                        ...channelInfo
                    }, { quoted: message });
                }
                
                const cleanDna = dnaInput.replace(/\s/g, '');
                await sock.sendMessage(chatId, { text: 'ðŸ”¬ Ø¬Ø§Ø±ÙŠ ÙÙƒ ØªØ´ÙÙŠØ± DNA...', ...channelInfo }, { quoted: message });
                
                const { stdout, stderr } = await execAsync(`"${binPath}" decode "${cleanDna}"`, { timeout: 30000, maxBuffer: 50 * 1024 * 1024 });
                
                if (stderr && !stdout) {
                    return await sock.sendMessage(chatId, { text: `âŒ ${stderr.trim()}`, ...channelInfo }, { quoted: message });
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
                        caption: `ðŸ§¬ *ØªÙ… ÙÙƒ ØªØ´ÙÙŠØ± DNA*\n\n` +
                            `ðŸ“¦ *Ø§Ù„Ù…Ù„Ù Ø§Ù„Ù…Ø³ØªØ¹Ø§Ø¯:* ${fileBuffer.length.toLocaleString()} Ø¨Ø§ÙŠØª`,
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
                            caption: `ðŸ§¬ *ØªÙ… ÙÙƒ ØªØ´ÙÙŠØ± DNA* â€” ${decoded.length} Ø­Ø±Ù`,
                            ...channelInfo
                        }, { quoted: message });
                        try { fs.unlinkSync(outFile); } catch { }
                    } else {
                        await sock.sendMessage(chatId, {
                            text: `ðŸ§¬ *ØªÙ… ÙÙƒ ØªØ´ÙÙŠØ± DNA*\n\n` +
                                `ðŸ“¤ *Ø§Ù„Ù†ØªÙŠØ¬Ø©:*\n\`\`\`\n${decoded}\n\`\`\``,
                            ...channelInfo
                        }, { quoted: message });
                    }
                }
            }
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `âŒ ÙØ´Ù„: ${error.message}`,
                ...channelInfo
            }, { quoted: message });
        }
    }
};

