const UNITS = {
    length: {
        mm: { factor: 0.001, base: 'm', name: 'Ù…Ù„ÙŠÙ…ØªØ±' },
        cm: { factor: 0.01, base: 'm', name: 'Ø³Ù†ØªÙŠÙ…ØªØ±' },
        m: { factor: 1, base: 'm', name: 'Ù…ØªØ±' },
        km: { factor: 1000, base: 'm', name: 'ÙƒÙŠÙ„ÙˆÙ…ØªØ±' },
        in: { factor: 0.0254, base: 'm', name: 'Ø¨ÙˆØµØ©' },
        ft: { factor: 0.3048, base: 'm', name: 'Ù‚Ø¯Ù…' },
        yd: { factor: 0.9144, base: 'm', name: 'ÙŠØ§Ø±Ø¯' },
        mi: { factor: 1609.344, base: 'm', name: 'Ù…ÙŠÙ„' },
        nmi: { factor: 1852, base: 'm', name: 'Ù…ÙŠÙ„ Ø¨Ø­Ø±ÙŠ' },
        ly: { factor: 9.461e15, base: 'm', name: 'Ø³Ù†Ø© Ø¶ÙˆØ¦ÙŠØ©' },
    },
    weight: {
        mg: { factor: 0.000001, base: 'kg', name: 'Ù…Ù„ÙŠØ¬Ø±Ø§Ù…' },
        g: { factor: 0.001, base: 'kg', name: 'Ø¬Ø±Ø§Ù…' },
        kg: { factor: 1, base: 'kg', name: 'ÙƒÙŠÙ„ÙˆØ¬Ø±Ø§Ù…' },
        t: { factor: 1000, base: 'kg', name: 'Ø·Ù†' },
        oz: { factor: 0.0283495, base: 'kg', name: 'Ø£ÙˆÙ†ØµØ©' },
        lb: { factor: 0.453592, base: 'kg', name: 'Ø±Ø·Ù„' },
        st: { factor: 6.35029, base: 'kg', name: 'Ø³ØªÙˆÙ†' },
    },
    temperature: {
        c: { factor: 1, offset: 0, base: 'c', name: 'Ø³ÙŠÙ„ÙŠØ³ÙŠÙˆØ³' },
        f: { factor: 1, offset: 0, base: 'c', name: 'ÙÙ‡Ø±Ù†Ù‡Ø§ÙŠØª' },
        k: { factor: 1, offset: 0, base: 'c', name: 'ÙƒÙ„ÙÙ†' },
    },
    speed: {
        mps: { factor: 1, base: 'mps', name: 'Ù…ØªØ±/Ø«Ø§Ù†ÙŠØ©' },
        kph: { factor: 0.277778, base: 'mps', name: 'ÙƒÙ…/Ø³Ø§Ø¹Ø©' },
        mph: { factor: 0.44704, base: 'mps', name: 'Ù…ÙŠÙ„/Ø³Ø§Ø¹Ø©' },
        knot: { factor: 0.514444, base: 'mps', name: 'Ø¹Ù‚Ø¯Ø©' },
        fps: { factor: 0.3048, base: 'mps', name: 'Ù‚Ø¯Ù…/Ø«Ø§Ù†ÙŠØ©' },
        mach: { factor: 343, base: 'mps', name: 'Ù…Ø§Ø®' },
    },
    data: {
        bit: { factor: 1, base: 'bit', name: 'Ø¨Øª' },
        byte: { factor: 8, base: 'bit', name: 'Ø¨Ø§ÙŠØª' },
        kb: { factor: 8000, base: 'bit', name: 'ÙƒÙŠÙ„ÙˆØ¨Ø§ÙŠØª' },
        mb: { factor: 8e6, base: 'bit', name: 'Ù…ÙŠØ¬Ø§Ø¨Ø§ÙŠØª' },
        gb: { factor: 8e9, base: 'bit', name: 'Ø¬ÙŠØ¬Ø§Ø¨Ø§ÙŠØª' },
        tb: { factor: 8e12, base: 'bit', name: 'ØªÙŠØ±Ø§Ø¨Ø§ÙŠØª' },
        pb: { factor: 8e15, base: 'bit', name: 'Ø¨ÙŠØªØ§Ø¨Ø§ÙŠØª' },
        kib: { factor: 8192, base: 'bit', name: 'ÙƒÙŠØ¨ÙŠØ¨Ø§ÙŠØª' },
        mib: { factor: 8388608, base: 'bit', name: 'Ù…ÙŠØ¨ÙŠØ¨Ø§ÙŠØª' },
        gib: { factor: 8589934592, base: 'bit', name: 'Ø¬ÙŠØ¨ÙŠØ¨Ø§ÙŠØª' },
    },
    area: {
        mm2: { factor: 1e-6, base: 'm2', name: 'Ù…Ù…Â²' },
        cm2: { factor: 1e-4, base: 'm2', name: 'Ø³Ù…Â²' },
        m2: { factor: 1, base: 'm2', name: 'Ù…Â²' },
        km2: { factor: 1e6, base: 'm2', name: 'ÙƒÙ…Â²' },
        in2: { factor: 0.00064516, base: 'm2', name: 'Ø¨ÙˆØµØ©Â²' },
        ft2: { factor: 0.092903, base: 'm2', name: 'Ù‚Ø¯Ù…Â²' },
        ac: { factor: 4046.86, base: 'm2', name: 'ÙØ¯Ø§Ù†' },
        ha: { factor: 10000, base: 'm2', name: 'Ù‡ÙƒØªØ§Ø±' },
    },
    volume: {
        ml: { factor: 0.001, base: 'l', name: 'Ù…Ù„ÙŠÙ„ØªØ±' },
        l: { factor: 1, base: 'l', name: 'Ù„ØªØ±' },
        m3: { factor: 1000, base: 'l', name: 'Ù…Â³' },
        tsp: { factor: 0.00492892, base: 'l', name: 'Ù…Ù„Ø¹Ù‚Ø© Ø´Ø§ÙŠ' },
        tbsp: { factor: 0.0147868, base: 'l', name: 'Ù…Ù„Ø¹Ù‚Ø© Ø·Ø¹Ø§Ù…' },
        floz: { factor: 0.0295735, base: 'l', name: 'Ø£ÙˆÙ†ØµØ© Ø³Ø§Ø¦Ù„Ø©' },
        cup: { factor: 0.236588, base: 'l', name: 'ÙƒÙˆØ¨' },
        pt: { factor: 0.473176, base: 'l', name: 'Ø¨Ø§ÙŠÙ†Øª' },
        qt: { factor: 0.946353, base: 'l', name: 'ÙƒÙˆØ§Ø±Øª' },
        gal: { factor: 3.78541, base: 'l', name: 'Ø¬Ø§Ù„ÙˆÙ†' },
    },
    time: {
        ms: { factor: 0.001, base: 's', name: 'Ù…ÙŠÙ„ÙŠ Ø«Ø§Ù†ÙŠØ©' },
        s: { factor: 1, base: 's', name: 'Ø«Ø§Ù†ÙŠØ©' },
        min: { factor: 60, base: 's', name: 'Ø¯Ù‚ÙŠÙ‚Ø©' },
        hr: { factor: 3600, base: 's', name: 'Ø³Ø§Ø¹Ø©' },
        day: { factor: 86400, base: 's', name: 'ÙŠÙˆÙ…' },
        wk: { factor: 604800, base: 's', name: 'Ø£Ø³Ø¨ÙˆØ¹' },
        mo: { factor: 2629800, base: 's', name: 'Ø´Ù‡Ø±' },
        yr: { factor: 31557600, base: 's', name: 'Ø³Ù†Ø©' },
    },
    pressure: {
        pa: { factor: 1, base: 'pa', name: 'Ø¨Ø§Ø³ÙƒØ§Ù„' },
        kpa: { factor: 1000, base: 'pa', name: 'ÙƒÙŠÙ„ÙˆØ¨Ø§Ø³ÙƒØ§Ù„' },
        mpa: { factor: 1e6, base: 'pa', name: 'Ù…ÙŠØ¬Ø§Ø¨Ø§Ø³ÙƒØ§Ù„' },
        bar: { factor: 100000, base: 'pa', name: 'Ø¨Ø§Ø±' },
        atm: { factor: 101325, base: 'pa', name: 'ØºÙ„Ø§Ù Ø¬ÙˆÙŠ' },
        psi: { factor: 6894.76, base: 'pa', name: 'PSI' },
        mmhg: { factor: 133.322, base: 'pa', name: 'Ù…Ù„Ù… Ø²Ø¦Ø¨Ù‚' },
    },
    energy: {
        j: { factor: 1, base: 'j', name: 'Ø¬ÙˆÙ„' },
        kj: { factor: 1000, base: 'j', name: 'ÙƒÙŠÙ„ÙˆØ¬ÙˆÙ„' },
        cal: { factor: 4.184, base: 'j', name: 'Ø³Ø¹Ø±Ø©' },
        kcal: { factor: 4184, base: 'j', name: 'ÙƒÙŠÙ„ÙˆØ³Ø¹Ø±Ø©' },
        wh: { factor: 3600, base: 'j', name: 'ÙˆØ§Ø·/Ø³Ø§Ø¹Ø©' },
        kwh: { factor: 3.6e6, base: 'j', name: 'ÙƒÙŠÙ„ÙˆÙˆØ§Ø·/Ø³Ø§Ø¹Ø©' },
        btu: { factor: 1055.06, base: 'j', name: 'BTU' },
        ev: { factor: 1.602e-19, base: 'j', name: 'Ø¥Ù„ÙƒØªØ±ÙˆÙ† ÙÙˆÙ„Øª' },
    },
};

// Ø¨Ù†Ø§Ø¡ Ø¨Ø­Ø« Ø¹ÙƒØ³ÙŠ: Ø±Ù…Ø² Ø§Ù„ÙˆØ­Ø¯Ø© â†’ Ø§Ù„ÙØ¦Ø©
const UNIT_TO_CATEGORY = {};
for (const [cat, units] of Object.entries(UNITS)) {
    for (const sym of Object.keys(units)) {
        UNIT_TO_CATEGORY[sym] = cat;
    }
}

function convertTemperature(value, from, to) {
    let celsius;
    if (from === 'c') celsius = value;
    else if (from === 'f') celsius = (value - 32) * 5 / 9;
    else celsius = value - 273.15;
    
    if (to === 'c') return celsius;
    if (to === 'f') return celsius * 9 / 5 + 32;
    return celsius + 273.15;
}

function convert(value, from, to) {
    from = from.toLowerCase();
    to = to.toLowerCase();
    const cat = UNIT_TO_CATEGORY[from];
    if (!cat || UNIT_TO_CATEGORY[to] !== cat) return null;
    
    if (cat === 'temperature') {
        return { result: convertTemperature(value, from, to), category: cat };
    }
    
    const fromUnit = UNITS[cat][from];
    const toUnit = UNITS[cat][to];
    const base = value * fromUnit.factor;
    const result = base / toUnit.factor;
    return { result, category: cat };
}

function formatNumber(n) {
    if (Math.abs(n) < 0.0001 || Math.abs(n) >= 1e12) return n.toExponential(4);
    const str = n.toPrecision(8).replace(/\.?0+$/, '');
    return str;
}

export default {
    command: 'ØªØ­ÙˆÙŠÙ„',
    aliases: ['units', 'convert', 'conv', 'unit', 'ÙˆØ­Ø¯Ø©'],
    category: 'Ù…Ø±Ø§ÙÙ‚',
    description: 'ØªØ­ÙˆÙŠÙ„ Ø¨ÙŠÙ† Ø£ÙƒØ«Ø± Ù…Ù† 100 ÙˆØ­Ø¯Ø©',
    usage: '!ØªØ­ÙˆÙŠÙ„ <Ø§Ù„Ù‚ÙŠÙ…Ø©> <Ù…Ù†> Ø¥Ù„Ù‰ <Ø¥Ù„Ù‰>\Ù†Ù…Ø«Ø§Ù„: !ØªØ­ÙˆÙŠÙ„ 100 ÙƒÙ… Ø¥Ù„Ù‰ Ù…ÙŠÙ„',
    
    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        const input = args.join(' ').trim().toLowerCase();
        
        if (!input) {
            return await sock.sendMessage(chatId, {
                text: `ðŸ“ *Ù…Ø­ÙˆÙ„ Ø§Ù„ÙˆØ­Ø¯Ø§Øª*\n\n` +
                    `*Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…:* \`!ØªØ­ÙˆÙŠÙ„ <Ø§Ù„Ù‚ÙŠÙ…Ø©> <Ù…Ù†> Ø¥Ù„Ù‰ <Ø¥Ù„Ù‰>\`\n\n` +
                    `*Ø£Ù…Ø«Ù„Ø©:*\n` +
                    `â€¢ \`!ØªØ­ÙˆÙŠÙ„ 100 ÙƒÙ… Ø¥Ù„Ù‰ Ù…ÙŠÙ„\`\n` +
                    `â€¢ \`!ØªØ­ÙˆÙŠÙ„ 70 ÙƒØ¬Ù… Ø¥Ù„Ù‰ Ø±Ø·Ù„\`\n` +
                    `â€¢ \`!ØªØ­ÙˆÙŠÙ„ 37 Ù… Ø¥Ù„Ù‰ Ù\`\n` +
                    `â€¢ \`!ØªØ­ÙˆÙŠÙ„ 1 Ø¬ÙŠØ¬Ø§ Ø¥Ù„Ù‰ Ù…ÙŠØ¬Ø§\`\n` +
                    `â€¢ \`!ØªØ­ÙˆÙŠÙ„ 60 Ù…ÙŠÙ„/Ø³ Ø¥Ù„Ù‰ ÙƒÙ…/Ø³\`\n` +
                    `â€¢ \`!ØªØ­ÙˆÙŠÙ„ 1 Ø³Ù†Ø© Ø¥Ù„Ù‰ ÙŠÙˆÙ…\`\n\n` +
                    `*Ø§Ù„ÙØ¦Ø§Øª Ø§Ù„Ù…Ø¯Ø¹ÙˆÙ…Ø©:*\n` +
                    `ðŸ“ Ø·ÙˆÙ„ Â· âš–ï¸ ÙˆØ²Ù† Â· ðŸŒ¡ï¸ Ø­Ø±Ø§Ø±Ø©\n` +
                    `ðŸ’¨ Ø³Ø±Ø¹Ø© Â· ðŸ’¾ Ø¨ÙŠØ§Ù†Ø§Øª Â· ðŸ“¦ Ø­Ø¬Ù…\n` +
                    `ðŸ—ºï¸ Ù…Ø³Ø§Ø­Ø© Â· â±ï¸ ÙˆÙ‚Øª Â· ðŸ”‹ Ø·Ø§Ù‚Ø© Â· ðŸŒ¬ï¸ Ø¶ØºØ·`,
                ...channelInfo
            }, { quoted: message });
        }
        
        // ØªØ­Ù„ÙŠÙ„ Ø§Ù„Ù…Ø¯Ø®Ù„Ø§Øª: <Ù‚ÙŠÙ…Ø©> <Ù…Ù†> Ø¥Ù„Ù‰ <Ø¥Ù„Ù‰>
        const toIndex = args.findIndex((a) => a.toLowerCase() === 'Ø¥Ù„Ù‰' || a.toLowerCase() === 'to');
        let value, fromUnit, toUnit;
        
        if (toIndex !== -1 && args.length === 4) {
            value = parseFloat(args[0]);
            fromUnit = args[1].toLowerCase();
            toUnit = args[3].toLowerCase();
        } else if (args.length === 3 && toIndex === -1) {
            value = parseFloat(args[0]);
            fromUnit = args[1].toLowerCase();
            toUnit = args[2].toLowerCase();
        } else {
            return await sock.sendMessage(chatId, {
                text: `âŒ ØµÙŠØºØ© ØºÙŠØ± ØµØ­ÙŠØ­Ø©.\n\nØ§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…: \`!ØªØ­ÙˆÙŠÙ„ 100 ÙƒÙ… Ø¥Ù„Ù‰ Ù…ÙŠÙ„\``,
                ...channelInfo
            }, { quoted: message });
        }
        
        if (isNaN(value)) {
            return await sock.sendMessage(chatId, {
                text: `âŒ Ù‚ÙŠÙ…Ø© ØºÙŠØ± ØµØ­ÙŠØ­Ø©: \`${args[0]}\``,
                ...channelInfo
            }, { quoted: message });
        }
        
        const res = convert(value, fromUnit, toUnit);
        
        if (!res) {
            const fromCat = UNIT_TO_CATEGORY[fromUnit];
            const toCat = UNIT_TO_CATEGORY[toUnit];
            
            if (!fromCat) {
                return await sock.sendMessage(chatId, {
                    text: `âŒ ÙˆØ­Ø¯Ø© ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙØ©: \`${fromUnit}\`\n\nØ§Ø³ØªØ®Ø¯Ù… \`!ØªØ­ÙˆÙŠÙ„\` Ù„Ø¹Ø±Ø¶ Ø¬Ù…ÙŠØ¹ Ø§Ù„ÙˆØ­Ø¯Ø§Øª Ø§Ù„Ù…Ø¯Ø¹ÙˆÙ…Ø©.`,
                    ...channelInfo
                }, { quoted: message });
            }
            if (!toCat) {
                return await sock.sendMessage(chatId, {
                    text: `âŒ ÙˆØ­Ø¯Ø© ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙØ©: \`${toUnit}\``,
                    ...channelInfo
                }, { quoted: message });
            }
            return await sock.sendMessage(chatId, {
                text: `âŒ Ù„Ø§ ÙŠÙ…ÙƒÙ† ØªØ­ÙˆÙŠÙ„ *${fromUnit}* (${fromCat}) Ø¥Ù„Ù‰ *${toUnit}* (${toCat}) â€” ÙØ¦Ø§Øª Ù…Ø®ØªÙ„ÙØ©.`,
                ...channelInfo
            }, { quoted: message });
        }
        
        const fromName = UNITS[res.category][fromUnit].name;
        const toName = UNITS[res.category][toUnit].name;
        
        const catEmojis = {
            length: 'ðŸ“', weight: 'âš–ï¸', temperature: 'ðŸŒ¡ï¸', speed: 'ðŸ’¨',
            data: 'ðŸ’¾', area: 'ðŸ—ºï¸', volume: 'ðŸ“¦', time: 'â±ï¸',
            pressure: 'ðŸŒ¬ï¸', energy: 'ðŸ”‹'
        };
        
        const categoryNames = {
            length: 'Ø·ÙˆÙ„', weight: 'ÙˆØ²Ù†', temperature: 'Ø­Ø±Ø§Ø±Ø©', speed: 'Ø³Ø±Ø¹Ø©',
            data: 'Ø¨ÙŠØ§Ù†Ø§Øª', area: 'Ù…Ø³Ø§Ø­Ø©', volume: 'Ø­Ø¬Ù…', time: 'ÙˆÙ‚Øª',
            pressure: 'Ø¶ØºØ·', energy: 'Ø·Ø§Ù‚Ø©'
        };
        
        const emoji = catEmojis[res.category] || 'ðŸ“';
        const categoryName = categoryNames[res.category] || res.category;
        
        await sock.sendMessage(chatId, {
            text: `${emoji} *Ù…Ø­ÙˆÙ„ Ø§Ù„ÙˆØ­Ø¯Ø§Øª*\n\n` +
                `ðŸ“¥ *Ø§Ù„Ø¥Ø¯Ø®Ø§Ù„:* ${value} ${fromName} (${fromUnit})\n` +
                `ðŸ“¤ *Ø§Ù„Ù†ØªÙŠØ¬Ø©:* ${formatNumber(res.result)} ${toName} (${toUnit})\n\n` +
                `ðŸ“‚ *Ø§Ù„ÙØ¦Ø©:* ${categoryName}\n\n` +
                `ðŸ”¥ *Crazy Seif BOT* | ðŸ“ž 01144534147`,
            ...channelInfo
        }, { quoted: message });
    }
};

