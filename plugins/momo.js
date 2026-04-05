const MOMO_DATA = {
    mtn: {
        name: 'MTN Mobile Money (MoMo)',
        countries: ['Ghana ðŸ‡¬ðŸ‡­', 'Uganda ðŸ‡ºðŸ‡¬', 'Rwanda ðŸ‡·ðŸ‡¼', 'Cameroon ðŸ‡¨ðŸ‡²', 'Ivory Coast ðŸ‡¨ðŸ‡®',
            'Zambia ðŸ‡¿ðŸ‡²', 'Benin ðŸ‡§ðŸ‡¯', 'South Africa ðŸ‡¿ðŸ‡¦', 'Nigeria ðŸ‡³ðŸ‡¬', 'Congo ðŸ‡¨ðŸ‡¬'],
        ussd: {
            'Ghana': '*170#',
            'Uganda': '*165#',
            'Rwanda': '*182#',
            'Cameroon': '*126#',
            'Nigeria': '*671#',
            'Zambia': '*303#',
        },
        shortcodes: {
            'Ghana': '1-300',
            'Uganda': '165',
            'Rwanda': '182',
        },
        features: [
            'Send & receive money',
            'Buy airtime & data',
            'Pay bills (electricity, water, TV)',
            'Bank transfers',
            'International transfers',
            'Merchant payments',
            'Savings & loans',
            'Insurance',
        ],
        website: 'mtn.com/momo',
        helpline: {
            'Ghana': '100',
            'Uganda': '100',
            'Rwanda': '100',
            'Nigeria': '180',
        }
    },
    airtel: {
        name: 'Airtel Money',
        countries: ['Kenya ðŸ‡°ðŸ‡ª', 'Tanzania ðŸ‡¹ðŸ‡¿', 'Uganda ðŸ‡ºðŸ‡¬', 'Rwanda ðŸ‡·ðŸ‡¼', 'Zambia ðŸ‡¿ðŸ‡²',
            'Malawi ðŸ‡²ðŸ‡¼', 'Madagascar ðŸ‡²ðŸ‡¬', 'Niger ðŸ‡³ðŸ‡ª', 'Congo DR ðŸ‡¨ðŸ‡©', 'Seychelles ðŸ‡¸ðŸ‡¨'],
        ussd: {
            'Kenya': '*334#',
            'Tanzania': '*150*60#',
            'Uganda': '*185#',
            'Rwanda': '*171#',
            'Zambia': '*778#',
            'Malawi': '*121#',
        },
        shortcodes: {
            'Kenya': '334',
            'Tanzania': '150',
            'Uganda': '185',
        },
        features: [
            'Send & receive money',
            'Buy airtime & data',
            'Pay bills',
            'Bank to Airtel Money',
            'Airtel Money to bank',
            'International remittance',
            'Merchant payments',
        ],
        website: 'airtel.com/airtelmoney',
        helpline: {
            'Kenya': '100',
            'Tanzania': '100',
            'Uganda': '100',
        }
    },
    mpesa: {
        name: 'M-Pesa',
        countries: ['Kenya ðŸ‡°ðŸ‡ª', 'Tanzania ðŸ‡¹ðŸ‡¿', 'Mozambique ðŸ‡²ðŸ‡¿', 'DRC ðŸ‡¨ðŸ‡©',
            'Lesotho ðŸ‡±ðŸ‡¸', 'Ghana ðŸ‡¬ðŸ‡­', 'Egypt ðŸ‡ªðŸ‡¬', 'Ethiopia ðŸ‡ªðŸ‡¹'],
        ussd: {
            'Kenya': '*334# or *737#',
            'Tanzania': '*150*00#',
            'Mozambique': '*150*5#',
            'Ghana': '*500#',
            'Egypt': '*9#',
        },
        shortcodes: {
            'Kenya': '737 / 334',
            'Tanzania': '150',
        },
        features: [
            'Send money (Lipa na M-Pesa)',
            'Withdraw at agents',
            'Buy airtime',
            'Pay bills & merchants',
            'M-Shwari savings & loans',
            'KCB M-Pesa loans',
            'International transfers (WorldRemit, Western Union)',
            'Pay with QR code',
            'M-Pesa App',
        ],
        website: 'safaricom.co.ke/mpesa',
        helpline: {
            'Kenya': '234',
            'Tanzania': '100',
        }
    },
    orange: {
        name: 'Orange Money',
        countries: ['Senegal ðŸ‡¸ðŸ‡³', 'Mali ðŸ‡²ðŸ‡±', 'Cameroon ðŸ‡¨ðŸ‡²', 'Ivory Coast ðŸ‡¨ðŸ‡®',
            'Burkina Faso ðŸ‡§ðŸ‡«', 'Guinea ðŸ‡¬ðŸ‡³', 'Madagascar ðŸ‡²ðŸ‡¬', 'Tunisia ðŸ‡¹ðŸ‡³'],
        ussd: {
            'Senegal': '#144#',
            'Mali': '#144#',
            'Cameroon': '#150#',
            'Ivory Coast': '#144#',
        },
        shortcodes: { 'Senegal': '144' },
        features: [
            'Send & receive money',
            'Buy airtime',
            'Pay bills',
            'Orange Bank transfers',
            'International transfers',
        ],
        website: 'orange.com/orangemoney',
        helpline: { 'Senegal': '888', 'Mali': '888' }
    },
    wave: {
        name: 'Wave Mobile Money',
        countries: ['Senegal ðŸ‡¸ðŸ‡³', 'Ivory Coast ðŸ‡¨ðŸ‡®', 'Mali ðŸ‡²ðŸ‡±', 'Burkina Faso ðŸ‡§ðŸ‡«',
            'Guinea ðŸ‡¬ðŸ‡³', 'Uganda ðŸ‡ºðŸ‡¬', 'Gambia ðŸ‡¬ðŸ‡²'],
        ussd: {
            'Senegal': '*999#',
            'Ivory Coast': '*999#',
        },
        shortcodes: {},
        features: [
            'Zero fees on transfers (between Wave users)',
            'Send & receive money',
            'Pay merchants',
            'Buy airtime',
            'Cash in/out at agents',
            'Wave App (iOS & Android)',
        ],
        website: 'wave.com',
        helpline: { 'Senegal': '33 889 05 55' }
    },
};
export default {
    command: 'مومو',
    aliases: ['mobilemoney', 'mpesa', 'airtelmoney', 'mtnmomo', 'wave', 'momo'],
    category: 'معلومات',
    description: 'موبيلي مونيي معلومات فور افريكان نيتووركس (متن, ايرتيل, م-بيسا, وافي, ورانجي)',
    usage: '.مومو متن\ن.مومو مبيسا\ن.مومو ايرتيل',
    async handler(sock, message, args, context) {
        const { chatId, channelInfo, userMessage } = context;
        // Detect from command used
        let query = args[0]?.toLowerCase() || '';
        if (userMessage.includes('mpesa'))
            query = 'mpesa';
        else if (userMessage.includes('airtelmoney'))
            query = 'airtel';
        else if (userMessage.includes('mtnmomo'))
            query = 'mtn';
        else if (userMessage.includes('wave'))
            query = 'wave';
        if (!query) {
            const list = Object.entries(MOMO_DATA).map(([k, v]) => `â€¢ \`.momo ${k}\` â€” ${v.name}`).join('\n');
            return await sock.sendMessage(chatId, {
                text: `ðŸ“¡ *Mobile Money Info*\n\n` +
                    `*Available networks:*\n${list}\n\n` +
                    `*Examples:*\n` +
                    `\`.momo mtn\`\n` +
                    `\`.momo mpesa\`\n` +
                    `\`.momo airtel\``,
                ...channelInfo
            }, { quoted: message });
        }
        // Fuzzy match
        const key = Object.keys(MOMO_DATA).find(k => query.includes(k) || k.includes(query) ||
            MOMO_DATA[k].name.toLowerCase().includes(query));
        if (!key) {
            return await sock.sendMessage(chatId, {
                text: `âŒ Unknown network: *${query}*\n\nAvailable: ${Object.keys(MOMO_DATA).join(', ')}`,
                ...channelInfo
            }, { quoted: message });
        }
        const m = MOMO_DATA[key];
        const ussdList = Object.entries(m.ussd).map(([c, u]) => `â€¢ ${c}: \`${u}\``).join('\n');
        const helpList = Object.entries(m.helpline).map(([c, h]) => `â€¢ ${c}: ${h}`).join('\n');
        const featureList = m.features.map(f => `âœ… ${f}`).join('\n');
        await sock.sendMessage(chatId, {
            text: `ðŸ“¡ *${m.name}*\n\n` +
                `ðŸŒ *Available in:*\n${m.countries.join(', ')}\n\n` +
                `ðŸ“² *USSD Codes:*\n${ussdList}\n\n` +
                `âš¡ *Features:*\n${featureList}\n\n${ 
                helpList ? `ðŸ“ž *Helpline:*\n${helpList}\n\n` : '' 
                }ðŸŒ *Website:* ${m.website}`,
            ...channelInfo
        }, { quoted: message });
    }
};



