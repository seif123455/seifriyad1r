import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
const execAsync = promisify(exec);
export default {
    command: 'سيمينفو',
    aliases: ['phoneinfo', 'numinfo', 'carrier', 'phinfo', 'siminfo'],
    category: 'مرافق',
    description: 'بحث بهوني رقم كوونتري, كارريير اند تيبي',
    usage: '.سيممعلومات <بهوني رقم ويته كوونتري كود>\نمثال: .سيممعلومات +923001234567',
    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        const input = args.join('').trim().replace(/\s+/g, '');
        if (!input) {
            return await sock.sendMessage(chatId, {
                text: `ðŸ“± *SIM / Phone Info*\n\n` +
                    `*Usage:* \`.siminfo <number>\`\n\n` +
                    `*Examples:*\n` +
                    `â€¢ \`.siminfo +923001234567\` â€” Pakistan\n` +
                    `â€¢ \`.siminfo +14155552671\` â€” USA\n` +
                    `â€¢ \`.siminfo +447911123456\` â€” UK\n` +
                    `â€¢ \`.siminfo +971501234567\` â€” UAE\n\n` +
                    `â„¹ï¸ Include country code with or without +`,
                ...channelInfo
            }, { quoted: message });
        }
        try {
            const scriptPath = path.join(process.cwd(), 'lib', 'siminfo.py');
            const { stdout } = await execAsync(`python3 "${scriptPath}" "${input}"`, { timeout: 10000 });
            const data = JSON.parse(stdout.trim());
            if (data.error) {
                return await sock.sendMessage(chatId, {
                    text: `âŒ ${data.error}`,
                    ...channelInfo
                }, { quoted: message });
            }
            const validIcon = data.valid ? 'âœ…' : 'âš ï¸';
            const carrierLine = data.carrier !== 'Unknown' ? `\nðŸ“¶ *Carrier:* ${data.carrier}` : '';
            await sock.sendMessage(chatId, {
                text: `ðŸ“± *Phone Number Info*\n\n` +
                    `ðŸ”¢ *Number:* ${data.number}\n` +
                    `${data.flag} *Country:* ${data.country}\n` +
                    `ðŸŒ *Region:* ${data.region}\n` +
                    `ðŸ·ï¸ *Country Code:* ${data.country_code}\n` +
                    `ðŸ“ž *National Number:* ${data.national_number}\n` +
                    `ðŸ“¡ *Line Type:* ${data.line_type}` +
                    `${carrierLine}\n` +
                    `${validIcon} *Valid:* ${data.valid ? 'Yes' : 'Possibly invalid (check length)'}`,
                ...channelInfo
            }, { quoted: message });
        }
        catch (error) {
            await sock.sendMessage(chatId, {
                text: `âŒ Lookup failed: ${error.message}`,
                ...channelInfo
            }, { quoted: message });
        }
    }
};



