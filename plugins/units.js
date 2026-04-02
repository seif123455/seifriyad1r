const UNITS = {
    length: {
        mm: { factor: 0.001, base: 'm', name: 'مليمتر' },
        cm: { factor: 0.01, base: 'm', name: 'سنتيمتر' },
        m: { factor: 1, base: 'm', name: 'متر' },
        km: { factor: 1000, base: 'm', name: 'كيلومتر' },
        in: { factor: 0.0254, base: 'm', name: 'بوصة' },
        ft: { factor: 0.3048, base: 'm', name: 'قدم' },
        yd: { factor: 0.9144, base: 'm', name: 'يارد' },
        mi: { factor: 1609.344, base: 'm', name: 'ميل' },
        nmi: { factor: 1852, base: 'm', name: 'ميل بحري' },
        ly: { factor: 9.461e15, base: 'm', name: 'سنة ضوئية' },
    },
    weight: {
        mg: { factor: 0.000001, base: 'kg', name: 'مليجرام' },
        g: { factor: 0.001, base: 'kg', name: 'جرام' },
        kg: { factor: 1, base: 'kg', name: 'كيلوجرام' },
        t: { factor: 1000, base: 'kg', name: 'طن' },
        oz: { factor: 0.0283495, base: 'kg', name: 'أونصة' },
        lb: { factor: 0.453592, base: 'kg', name: 'رطل' },
        st: { factor: 6.35029, base: 'kg', name: 'ستون' },
    },
    temperature: {
        c: { factor: 1, offset: 0, base: 'c', name: 'سيليسيوس' },
        f: { factor: 1, offset: 0, base: 'c', name: 'فهرنهايت' },
        k: { factor: 1, offset: 0, base: 'c', name: 'كلفن' },
    },
    speed: {
        mps: { factor: 1, base: 'mps', name: 'متر/ثانية' },
        kph: { factor: 0.277778, base: 'mps', name: 'كم/ساعة' },
        mph: { factor: 0.44704, base: 'mps', name: 'ميل/ساعة' },
        knot: { factor: 0.514444, base: 'mps', name: 'عقدة' },
        fps: { factor: 0.3048, base: 'mps', name: 'قدم/ثانية' },
        mach: { factor: 343, base: 'mps', name: 'ماخ' },
    },
    data: {
        bit: { factor: 1, base: 'bit', name: 'بت' },
        byte: { factor: 8, base: 'bit', name: 'بايت' },
        kb: { factor: 8000, base: 'bit', name: 'كيلوبايت' },
        mb: { factor: 8e6, base: 'bit', name: 'ميجابايت' },
        gb: { factor: 8e9, base: 'bit', name: 'جيجابايت' },
        tb: { factor: 8e12, base: 'bit', name: 'تيرابايت' },
        pb: { factor: 8e15, base: 'bit', name: 'بيتابايت' },
        kib: { factor: 8192, base: 'bit', name: 'كيبيبايت' },
        mib: { factor: 8388608, base: 'bit', name: 'ميبيبايت' },
        gib: { factor: 8589934592, base: 'bit', name: 'جيبيبايت' },
    },
    area: {
        mm2: { factor: 1e-6, base: 'm2', name: 'مم²' },
        cm2: { factor: 1e-4, base: 'm2', name: 'سم²' },
        m2: { factor: 1, base: 'm2', name: 'م²' },
        km2: { factor: 1e6, base: 'm2', name: 'كم²' },
        in2: { factor: 0.00064516, base: 'm2', name: 'بوصة²' },
        ft2: { factor: 0.092903, base: 'm2', name: 'قدم²' },
        ac: { factor: 4046.86, base: 'm2', name: 'فدان' },
        ha: { factor: 10000, base: 'm2', name: 'هكتار' },
    },
    volume: {
        ml: { factor: 0.001, base: 'l', name: 'مليلتر' },
        l: { factor: 1, base: 'l', name: 'لتر' },
        m3: { factor: 1000, base: 'l', name: 'م³' },
        tsp: { factor: 0.00492892, base: 'l', name: 'ملعقة شاي' },
        tbsp: { factor: 0.0147868, base: 'l', name: 'ملعقة طعام' },
        floz: { factor: 0.0295735, base: 'l', name: 'أونصة سائلة' },
        cup: { factor: 0.236588, base: 'l', name: 'كوب' },
        pt: { factor: 0.473176, base: 'l', name: 'باينت' },
        qt: { factor: 0.946353, base: 'l', name: 'كوارت' },
        gal: { factor: 3.78541, base: 'l', name: 'جالون' },
    },
    time: {
        ms: { factor: 0.001, base: 's', name: 'ميلي ثانية' },
        s: { factor: 1, base: 's', name: 'ثانية' },
        min: { factor: 60, base: 's', name: 'دقيقة' },
        hr: { factor: 3600, base: 's', name: 'ساعة' },
        day: { factor: 86400, base: 's', name: 'يوم' },
        wk: { factor: 604800, base: 's', name: 'أسبوع' },
        mo: { factor: 2629800, base: 's', name: 'شهر' },
        yr: { factor: 31557600, base: 's', name: 'سنة' },
    },
    pressure: {
        pa: { factor: 1, base: 'pa', name: 'باسكال' },
        kpa: { factor: 1000, base: 'pa', name: 'كيلوباسكال' },
        mpa: { factor: 1e6, base: 'pa', name: 'ميجاباسكال' },
        bar: { factor: 100000, base: 'pa', name: 'بار' },
        atm: { factor: 101325, base: 'pa', name: 'غلاف جوي' },
        psi: { factor: 6894.76, base: 'pa', name: 'PSI' },
        mmhg: { factor: 133.322, base: 'pa', name: 'ملم زئبق' },
    },
    energy: {
        j: { factor: 1, base: 'j', name: 'جول' },
        kj: { factor: 1000, base: 'j', name: 'كيلوجول' },
        cal: { factor: 4.184, base: 'j', name: 'سعرة' },
        kcal: { factor: 4184, base: 'j', name: 'كيلوسعرة' },
        wh: { factor: 3600, base: 'j', name: 'واط/ساعة' },
        kwh: { factor: 3.6e6, base: 'j', name: 'كيلوواط/ساعة' },
        btu: { factor: 1055.06, base: 'j', name: 'BTU' },
        ev: { factor: 1.602e-19, base: 'j', name: 'إلكترون فولت' },
    },
};

// بناء بحث عكسي: رمز الوحدة → الفئة
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
    command: 'تحويل',
    aliases: ['units', 'convert', 'conv', 'unit', 'وحدة'],
    category: 'utility',
    description: 'تحويل بين أكثر من 100 وحدة',
    usage: '!تحويل <القيمة> <من> إلى <إلى>\nمثال: !تحويل 100 كم إلى ميل',
    
    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        const input = args.join(' ').trim().toLowerCase();
        
        if (!input) {
            return await sock.sendMessage(chatId, {
                text: `📏 *محول الوحدات*\n\n` +
                    `*الاستخدام:* \`!تحويل <القيمة> <من> إلى <إلى>\`\n\n` +
                    `*أمثلة:*\n` +
                    `• \`!تحويل 100 كم إلى ميل\`\n` +
                    `• \`!تحويل 70 كجم إلى رطل\`\n` +
                    `• \`!تحويل 37 م إلى ف\`\n` +
                    `• \`!تحويل 1 جيجا إلى ميجا\`\n` +
                    `• \`!تحويل 60 ميل/س إلى كم/س\`\n` +
                    `• \`!تحويل 1 سنة إلى يوم\`\n\n` +
                    `*الفئات المدعومة:*\n` +
                    `📐 طول · ⚖️ وزن · 🌡️ حرارة\n` +
                    `💨 سرعة · 💾 بيانات · 📦 حجم\n` +
                    `🗺️ مساحة · ⏱️ وقت · 🔋 طاقة · 🌬️ ضغط`,
                ...channelInfo
            }, { quoted: message });
        }
        
        // تحليل المدخلات: <قيمة> <من> إلى <إلى>
        const toIndex = args.findIndex((a) => a.toLowerCase() === 'إلى' || a.toLowerCase() === 'to');
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
                text: `❌ صيغة غير صحيحة.\n\nالاستخدام: \`!تحويل 100 كم إلى ميل\``,
                ...channelInfo
            }, { quoted: message });
        }
        
        if (isNaN(value)) {
            return await sock.sendMessage(chatId, {
                text: `❌ قيمة غير صحيحة: \`${args[0]}\``,
                ...channelInfo
            }, { quoted: message });
        }
        
        const res = convert(value, fromUnit, toUnit);
        
        if (!res) {
            const fromCat = UNIT_TO_CATEGORY[fromUnit];
            const toCat = UNIT_TO_CATEGORY[toUnit];
            
            if (!fromCat) {
                return await sock.sendMessage(chatId, {
                    text: `❌ وحدة غير معروفة: \`${fromUnit}\`\n\nاستخدم \`!تحويل\` لعرض جميع الوحدات المدعومة.`,
                    ...channelInfo
                }, { quoted: message });
            }
            if (!toCat) {
                return await sock.sendMessage(chatId, {
                    text: `❌ وحدة غير معروفة: \`${toUnit}\``,
                    ...channelInfo
                }, { quoted: message });
            }
            return await sock.sendMessage(chatId, {
                text: `❌ لا يمكن تحويل *${fromUnit}* (${fromCat}) إلى *${toUnit}* (${toCat}) — فئات مختلفة.`,
                ...channelInfo
            }, { quoted: message });
        }
        
        const fromName = UNITS[res.category][fromUnit].name;
        const toName = UNITS[res.category][toUnit].name;
        
        const catEmojis = {
            length: '📐', weight: '⚖️', temperature: '🌡️', speed: '💨',
            data: '💾', area: '🗺️', volume: '📦', time: '⏱️',
            pressure: '🌬️', energy: '🔋'
        };
        
        const categoryNames = {
            length: 'طول', weight: 'وزن', temperature: 'حرارة', speed: 'سرعة',
            data: 'بيانات', area: 'مساحة', volume: 'حجم', time: 'وقت',
            pressure: 'ضغط', energy: 'طاقة'
        };
        
        const emoji = catEmojis[res.category] || '📏';
        const categoryName = categoryNames[res.category] || res.category;
        
        await sock.sendMessage(chatId, {
            text: `${emoji} *محول الوحدات*\n\n` +
                `📥 *الإدخال:* ${value} ${fromName} (${fromUnit})\n` +
                `📤 *النتيجة:* ${formatNumber(res.result)} ${toName} (${toUnit})\n\n` +
                `📂 *الفئة:* ${categoryName}\n\n` +
                `🔥 *CRAZY-SEIF BOT* | 📞 201144534147`,
            ...channelInfo
        }, { quoted: message });
    }
};