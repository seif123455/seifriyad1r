// Safe math evaluator using pure Node.js - no Python needed
function safeMath(expr) {
    // Replace math function names to JS equivalents
    const sanitized = expr
        .replace(/\^/g, '**')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/cbrt\(/g, 'Math.cbrt(')
        .replace(/abs\(/g, 'Math.abs(')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/floor\(/g, 'Math.floor(')
        .replace(/ceil\(/g, 'Math.ceil(')
        .replace(/round\(/g, 'Math.round(')
        .replace(/pow\(/g, 'Math.pow(')
        .replace(/min\(/g, 'Math.min(')
        .replace(/max\(/g, 'Math.max(')
        .replace(/\bpi\b/gi, String(Math.PI))
        .replace(/\be\b/g, String(Math.E));
    // Block anything dangerous
    const blocked = /[a-zA-Z_$](?!ath\.)(?![0-9])/;
    const mathFunctions = /Math\.[a-z]+/g;
    const cleaned = sanitized.replace(mathFunctions, '');
    if (blocked.test(cleaned)) {
        throw new Error('Invalid expression â€” only math operators and functions allowed');
    }
    // Only allow safe characters
    if (!/^[\d\s+\-*/%.(),Math.a-zA-Z]+$/.test(sanitized)) {
        throw new Error('Invalid characters in expression');
    }
    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${sanitized})`)();
    if (typeof result !== 'number')
        throw new Error('Result is not a number');
    if (!isFinite(result))
        throw new Error('Result is Infinity or NaN');
    return Number.isInteger(result) ? String(result) : result.toPrecision(10).replace(/\.?0+$/, '');
}
export default {
    command: 'آلة حاسبة',
    aliases: ['math', 'calculate', 'solve', 'calc'],
    category: 'مرافق',
    description: '',
    usage: '.كالك <يكسبريسسيون>',
    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        const expr = args.join(' ').trim();
        if (!expr) {
            return await sock.sendMessage(chatId, {
                text: `ðŸ§® *CALCULATOR*\n\n` +
                    `*Usage:* \`.كالك <يكسبريسسيون>\`\n\n` +
                    `*Examples:*\n` +
                    `â€¢ \`.calc 2 ** 10\` â†’ 1024\n` +
                    `â€¢ \`.calc sqrt(144)\` â†’ 12\n` +
                    `â€¢ \`.calc sin(pi / 2)\` â†’ 1\n` +
                    `â€¢ \`.calc log(1000)\` â†’ 3\n` +
                    `â€¢ \`.calc (3 + 4) * 2\` â†’ 14\n` +
                    `â€¢ \`.calc pow(2, 8)\` â†’ 256\n\n` +
                    `*Functions:* sqrt, cbrt, abs, sin, cos, tan, log, ln, floor, ceil, round, pow, min, max\n` +
                    `*Constants:* pi, e`,
                ...channelInfo
            }, { quoted: message });
        }
        try {
            const result = safeMath(expr);
            await sock.sendMessage(chatId, {
                text: `ðŸ§® *Calculator*\n\nðŸ“¥ *Input:* \`${expr}\`\nðŸ“¤ *Result:* \`${result}\``,
                ...channelInfo
            }, { quoted: message });
        }
        catch (error) {
            await sock.sendMessage(chatId, {
                text: `âŒ *Error:* ${error.message}`,
                ...channelInfo
            }, { quoted: message });
        }
    }
};



