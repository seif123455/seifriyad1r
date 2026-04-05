import { getBin } from '../lib/compile.js';
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);
export default {
    command: 'كيبهير',
    aliases: ['encrypt', 'decrypt', 'encode', 'crypt', 'cipher'],
    category: 'مرافق',
    description: '',
    usage: '.كيبهير <تيبي> <ينكود|ديكود> <كيي> <نص>',
    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        if (args.length < 4) {
            return await sock.sendMessage(chatId, {
                text: `ðŸ” *Text Cipher*\n\n` +
                    `*Usage:* \`.cipher <type> <enكود|deكود> <key> <نص>\`\n\n` +
                    `*Cipher types:*\n\n` +
                    `*caesar* â€” shift letters by a number (key = number)\n` +
                    `â€¢ \`.cipher caesar encode 13 Hello World\`\n` +
                    `â€¢ \`.cipher caesar decode 13 Uryyb Jbeyq\`\n\n` +
                    `*vigenere* â€” polyalphabetic cipher (key = word)\n` +
                    `â€¢ \`.cipher vigenere encode SECRET Hello World\`\n` +
                    `â€¢ \`.cipher vigenere decode SECRET Zincs Pgvnu\`\n\n` +
                    `*xor* â€” XOR byte cipher, output is hex (key = any text)\n` +
                    `â€¢ \`.cipher xor encode mykey Hello\`\n` +
                    `â€¢ \`.cipher xor decode mykey 25090a0e06\``,
                ...channelInfo
            }, { quoted: message });
        }
        const cipherType = args[0].toLowerCase();
        const mode = args[1].toLowerCase();
        const key = args[2];
        const text = args.slice(3).join(' ').trim();
        if (!['caesar', 'vigenere', 'xor'].includes(cipherType)) {
            return await sock.sendMessage(chatId, {
                text: `âŒ Unknown cipher: *${cipherType}*\nUse: \`caesar\`, \`vigenere\`, or \`xor\``,
                ...channelInfo
            }, { quoted: message });
        }
        if (!['encode', 'decode', 'encrypt', 'decrypt'].includes(mode)) {
            return await sock.sendMessage(chatId, {
                text: `âŒ Unknown mode: *${mode}*\nUse: \`encode\` or \`decode\``,
                ...channelInfo
            }, { quoted: message });
        }
        if (!text) {
            return await sock.sendMessage(chatId, {
                text: `âŒ No text provided.`,
                ...channelInfo
            }, { quoted: message });
        }
        if (cipherType === 'caesar' && isNaN(parseInt(key, 10))) {
            return await sock.sendMessage(chatId, {
                text: `âŒ Caesar cipher key must be a number (e.g. 13)`,
                ...channelInfo
            }, { quoted: message });
        }
        try {
            const bin = getBin('cipher');
            const safeText = text.replace(/"/g, '\\"');
            const safeKey = key.replace(/"/g, '\\"');
            const { stdout, stderr } = await execAsync(`"${bin}" ${cipherType} ${mode} "${safeKey}" "${safeText}"`, { timeout: 10000 });
            if (stderr && !stdout) {
                return await sock.sendMessage(chatId, {
                    text: `âŒ ${stderr.trim()}`,
                    ...channelInfo
                }, { quoted: message });
            }
            const result = stdout.trim();
            const cipherNames = {
                caesar: 'Caesar', vigenere: 'VigenÃ¨re', xor: 'XOR'
            };
            const modeLabel = (mode === 'encode' || mode === 'encrypt') ? 'ðŸ”’ Encrypted' : 'ðŸ”“ Decrypted';
            await sock.sendMessage(chatId, {
                text: `ðŸ” *${cipherNames[cipherType]} Cipher*\n\n` +
                    `ðŸ“¥ *Input:* \`${text}\`\n` +
                    `ðŸ”‘ *Key:* \`${key}\`\n` +
                    `${modeLabel}: \`${result}\``,
                ...channelInfo
            }, { quoted: message });
        }
        catch (error) {
            await sock.sendMessage(chatId, {
                text: `âŒ Failed: ${error.message}`,
                ...channelInfo
            }, { quoted: message });
        }
    }
};




