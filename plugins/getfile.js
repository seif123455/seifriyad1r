import { promises as fs } from 'fs';
import path from 'path';
export default {
    command: 'جيتفيلي',
    aliases: ['readfile', 'viewfile', 'getfile'],
    category: 'المالك',
    description: 'رياد اند عرض ملف كونتينتس فروم بوت ديريكتوري',
    usage: '.جلبملف <ملفنامي>',
    ownerOnly: true,
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const filename = args.join(' ').trim();
        try {
            if (!filename) {
                return await sock.sendMessage(chatId, {
                    text: `*ðŸ“„ Get File*\n\n*Usage:*\n.جلبملف <ملفname>\n\n*Examples:*\nâ€¢ .getfile index.js\nâ€¢ .getfile plugins/ping.js\nâ€¢ .getfile settings.js\nâ€¢ .getfile package.json`
                }, { quoted: message });
            }
            // Check project root first, then dist/ for compiled files
            let filePath = path.join(process.cwd(), filename);
            try {
                await fs.access(filePath);
            }
            catch {
                // Try dist/ for .js files
                const distPath = path.join(process.cwd(), 'dist', filename);
                try {
                    await fs.access(distPath);
                    filePath = distPath;
                }
                catch { /* will fail below */ }
            }
            try {
                await fs.access(filePath);
            }
            catch {
                return await sock.sendMessage(chatId, {
                    text: `âŒ *File not found!*\n\nNo file named "${filename}" exists.\n\n*Tip:* Use relative path from bot root directory.`
                }, { quoted: message });
            }
            const fileContent = await fs.readFile(filePath, 'utf8');
            if (!fileContent || fileContent.length === 0) {
                return await sock.sendMessage(chatId, {
                    text: `âš ï¸ *File is empty*\n\nThe file "${filename}" has no content.`
                }, { quoted: message });
            }
            if (fileContent.length > 60000) {
                return await sock.sendMessage(chatId, {
                    text: `âŒ *File too large!*\n\nThe file "${filename}" is too large to display (${Math.round(fileContent.length / 1024)}KB).\n\n*Limit:* 60KB\n\n*Tip:* Use a file manager or split the file.`
                }, { quoted: message });
            }
            const stats = await fs.stat(filePath);
            const fileSize = (stats.size / 1024).toFixed(2);
            const lastModified = stats.mtime.toLocaleString();
            const caption = `ðŸ“„ *File: ${filename}*\n\n` +
                `ðŸ“Š *Size:* ${fileSize} KB\n` +
                `ðŸ“… *Modified:* ${lastModified}\n` +
                `ðŸ“ *Lines:* ${fileContent.split('\n').length}\n\n` +
                `\`\`\`${fileContent}\`\`\``;
            await sock.sendMessage(chatId, {
                text: caption
            }, { quoted: message });
        }
        catch (error) {
            console.error('GetFile Error:', error);
            await sock.sendMessage(chatId, {
                text: `âŒ *Error reading file*\n\n*Error:* ${error.message}\n\n*Possible reasons:*\nâ€¢ File is corrupted\nâ€¢ No read permissions\nâ€¢ Invalid file path`
            }, { quoted: message });
        }
    }
};




