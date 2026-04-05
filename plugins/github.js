import moment from 'moment-timezone';
import fs from 'fs';
import path from 'path';
export default {
    command: 'سكريبت',
    aliases: ['repo', 'sc', 'script'],
    category: 'معلومات',
    description: 'جلب معلوماترماتيون ابووت تهي ميجا-مد جيتهوب ريبوسيتوري',
    usage: '.سكريبت',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        try {
            const res = await fetch('https://api.github.com/repos/CrazySeif/MEGA-MD');
            if (!res.ok)
                throw new Error('Error fetching repository data');
            const json = await res.json();
            let txt = `*ä¹‚  MEGA MDX  ä¹‚*\n\n`;
            txt += `âœ©  *Name* : ${json.name}\n`;
            txt += `âœ©  *Watchers* : ${json.watchers_count}\n`;
            txt += `âœ©  *Size* : ${(json.size / 1024).toFixed(2)} MB\n`;
            txt += `âœ©  *Last Updated* : ${moment(json.updated_at).format('DD/MM/YY - HH:mm:ss')}\n`;
            txt += `âœ©  *URL* : ${json.html_url}\n`;
            txt += `âœ©  *Forks* : ${json.forks_count}\n`;
            txt += `âœ©  *Stars* : ${json.stargazers_count}\n\n`;
            txt += `ðŸ’¥ *MEGA MD*`;
            const imgPath = path.join(process.cwd(), 'assets/thumb.png');
            const imgBuffer = fs.readFileSync(imgPath);
            await sock.sendMessage(chatId, { image: imgBuffer, caption: txt }, { quoted: message });
        }
        catch (error) {
            console.error('Error in github command:', error);
            await sock.sendMessage(chatId, { text: 'âŒ Error fetching repository information.' }, { quoted: message });
        }
    }
};



