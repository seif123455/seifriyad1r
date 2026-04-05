import axios from 'axios';
export default {
    command: 'ميديكيني',
    aliases: ['drug', 'medinfo', 'druginfo', 'med', 'medicine'],
    category: 'معلومات',
    description: 'جلب ميديكيني/دروج معلومات: وسيس, سيدي يففيكتس, تحذيرينجس',
    usage: '.ميديكيني اسبيرين\ن.ميديكيني باراكيتامول',
    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        const query = args.join(' ').trim();
        if (!query) {
            return await sock.sendMessage(chatId, {
                text: `ðŸ’Š *Medicine Info*\n\n` +
                    `*Usage:* \`.medicine <name>\`\n\n` +
                    `*Examples:*\n` +
                    `â€¢ \`.medicine aspirin\`\n` +
                    `â€¢ \`.medicine paracetamol\`\n` +
                    `â€¢ \`.medicine amoxicillin\`\n` +
                    `â€¢ \`.medicine ibuprofen\`\n` +
                    `â€¢ \`.medicine metformin\`\n\n` +
                    `âš ï¸ _Information is from FDA database. Always consult a doctor._`,
                ...channelInfo
            }, { quoted: message });
        }
        await sock.sendMessage(chatId, { text: `ðŸ” Looking up *${query}*...`, ...channelInfo }, { quoted: message });
        try {
            const res = await axios.get(`https://api.fda.gov/drug/label.json?search=${encodeURIComponent(query)}&limit=1`, { timeout: 15000 });
            const result = res.data.results?.[0];
            if (!result) {
                return await sock.sendMessage(chatId, {
                    text: `âŒ No information found for: *${query}*\n\nTry the generic name (e.g. paracetamol instead of Panadol)`,
                    ...channelInfo
                }, { quoted: message });
            }
            const openfda = result.openfda || {};
            const brandName = openfda.brand_name?.[0] || query;
            const genericName = openfda.generic_name?.[0] || 'N/A';
            const manufacturer = openfda.manufacturer_name?.[0] || 'N/A';
            const route = openfda.route?.[0] || 'N/A';
            const substanceName = openfda.substance_name?.[0] || 'N/A';
            const clean = (text, maxLen = 400) => {
                if (!text)
                    return 'N/A';
                const str = Array.isArray(text) ? text[0] : text;
                const cleaned = str.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
                return cleaned.length > maxLen ? `${cleaned.substring(0, maxLen) }...` : cleaned;
            };
            const purpose = clean(result.purpose, 300);
            const indications = clean(result.indications_and_usage, 400);
            const warnings = clean(result.warnings, 400);
            const sideEffects = clean(result.adverse_reactions, 400);
            const dosage = clean(result.dosage_and_administration, 300);
            const storage = clean(result.storage_and_handling, 200);
            let text = `ðŸ’Š *${brandName}*\n`;
            if (genericName !== 'N/A')
                text += `_(${genericName})_\n`;
            text += `\n`;
            if (substanceName !== 'N/A')
                text += `ðŸ§ª *Active Substance:* ${substanceName}\n`;
            text += `ðŸ­ *Manufacturer:* ${manufacturer}\n`;
            text += `ðŸ’‰ *Route:* ${route}\n\n`;
            if (purpose !== 'N/A')
                text += `ðŸŽ¯ *Purpose:*\n${purpose}\n\n`;
            if (indications !== 'N/A')
                text += `âœ… *Uses:*\n${indications}\n\n`;
            if (dosage !== 'N/A')
                text += `ðŸ“ *Dosage:*\n${dosage}\n\n`;
            if (warnings !== 'N/A')
                text += `âš ï¸ *Warnings:*\n${warnings}\n\n`;
            if (sideEffects !== 'N/A')
                text += `ðŸ”´ *Side Effects:*\n${sideEffects}\n\n`;
            if (storage !== 'N/A')
                text += `ðŸ“¦ *Storage:* ${storage}\n\n`;
            text += `âš•ï¸ _Always consult a qualified doctor before taking any medication._`;
            await sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });
        }
        catch (error) {
            if (error.response?.status === 404) {
                return await sock.sendMessage(chatId, {
                    text: `âŒ Medicine not found: *${query}*\n\nTry using the generic/scientific name.`,
                    ...channelInfo
                }, { quoted: message });
            }
            await sock.sendMessage(chatId, {
                text: `âŒ Failed: ${error.message}`,
                ...channelInfo
            }, { quoted: message });
        }
    }
};



