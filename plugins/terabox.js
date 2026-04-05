import axios from 'axios';
import fs from 'fs';
import path from 'path';
export default {
    command: 'تيرابوكس',
    aliases: ['tera', 'tbox', 'tbdl', 'terabox'],
    category: 'التحميل',
    description: 'تحميل ملفس فروم تيرابوكس',
    usage: '.تيرابوكس <تيرابوكس رابط>',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        const apiCallWithRetry = async (url, maxRetries = 3, baseDelay = 2000) => {
            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    await wait(1000);
                    const response = await axios.get(url, {
                        timeout: 60000,
                        headers: { 'User-Agent': 'Mozilla/5.0' }
                    });
                    return response;
                }
                catch (error) {
                    const isRateLimited = error.response?.status === 429 ||
                        error.code === 'ECONNABORTED' ||
                        error.code === 'ETIMEDOUT';
                    if (attempt === maxRetries)
                        throw error;
                    if (isRateLimited) {
                        const delay = baseDelay * Math.pow(2, attempt - 1);
                        console.log(`Retrying in ${delay}ms... (${attempt}/${maxRetries})`);
                        await wait(delay);
                    }
                    else {
                        throw error;
                    }
                }
            }
        };
        const downloadFileWithProgress = async (url, filepath, maxRetries = 3) => {
            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    const response = await axios({
                        method: 'GET',
                        url,
                        responseType: 'arraybuffer', // Changed to arraybuffer for better stability
                        timeout: 600000, // 10 minutes
                        maxContentLength: Infinity,
                        maxBodyLength: Infinity,
                        headers: {
                            'User-Agent': 'Mozilla/5.0',
                            'Referer': 'https://1024terabox.com/',
                            'Accept': '*/*',
                            'Connection': 'keep-alive'
                        }
                    });
                    fs.writeFileSync(filepath, response.data);
                    return true;
                }
                catch (error) {
                    console.error(`Download attempt ${attempt} failed:`, error.message);
                    if (attempt === maxRetries) {
                        throw error;
                    }
                    // Wait before retry
                    const delay = 2000 * attempt;
                    console.log(`Retrying download in ${delay}ms...`);
                    await wait(delay);
                }
            }
        };
        const isValidTeraBoxUrl = (url) => {
            return url.includes('terabox.com') ||
                url.includes('1024terabox.com') ||
                url.includes('teraboxapp.com') ||
                url.includes('terabox.app');
        };
        try {
            const url = args.join(' ').trim();
            if (!url) {
                return await sock.sendMessage(chatId, { text: 'ðŸ“¦ *TeraBox Downloader*\n\nUsage:\n.terabox <terabox رابط>\n\nExample:\n.terabox https://1024terabox.com/s/xxxxx' }, { quoted: message });
            }
            if (!isValidTeraBoxUrl(url)) {
                return await sock.sendMessage(chatId, { text: 'âŒ *Invalid TeraBox link!*\n\nPlease provide a valid TeraBox URL.' }, { quoted: message });
            }
            await sock.sendMessage(chatId, { text: 'â³ *Processing TeraBox link...*\n\nPlease wait, fetching file information...' }, { quoted: message });
            // Fetch file information
            const apiUrl = `https://api.qasimdev.dpdns.org/api/terabox/download?apiKey=qasim-dev&url=${encodeURIComponent(url)}`;
            const apiResponse = await apiCallWithRetry(apiUrl, 3, 3000);
            if (!apiResponse?.data?.success || !apiResponse.data?.data?.files || apiResponse?.data?.data?.files?.length === 0) {
                return await sock.sendMessage(chatId, { text: 'âŒ *Download failed!*\n\nNo files found or invalid link.' }, { quoted: message });
            }
            const fileData = apiResponse.data.data;
            const files = fileData.files;
            const totalFiles = fileData.totalFiles;
            // Process first file
            const file = files[0];
            const title = file.title;
            const size = file.size;
            const downloadUrl = file.downloadUrl;
            const fileType = file.type;
            // Show file info without thumbnail to avoid issues
            await sock.sendMessage(chatId, { text: `ðŸ“¦ *TeraBox File*\n\nðŸ“„ *Name:* ${title}\nðŸ“Š *Size:* ${size}\nðŸ“ *Type:* ${fileType}\nðŸ“‚ *Total Files:* ${totalFiles}\n\nâ³ *Downloading...*\nPlease wait, this may take a while for large files...` }, { quoted: message });
            // Create temp directory
            const tempDir = path.join(process.cwd(), 'tmp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            const sanitizedTitle = title.replace(/[^a-z0-9.]/gi, '_').substring(0, 100);
            const filename = `${Date.now()}_${sanitizedTitle}`;
            const filePath = path.join(tempDir, filename);
            // Download file
            await downloadFileWithProgress(downloadUrl, filePath);
            // Check file size
            const stats = fs.statSync(filePath);
            const fileSizeInMB = stats.size / (1024 * 1024);
            // WhatsApp has file size limits
            if (fileSizeInMB > 100) {
                fs.unlinkSync(filePath);
                return await sock.sendMessage(chatId, { text: `âŒ *File too large!*\n\nðŸ“„ *File:* ${title}\nðŸ“Š *Size:* ${size}\n\nâš ï¸ WhatsApp has a 100MB file limit.\nThis file is ${fileSizeInMB.toFixed(2)}MB.` }, { quoted: message });
            }
            // Determine file type and send accordingly
            const fileExtension = title.split('.').pop().toLowerCase();
            const videoExtensions = ['mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'webm', '3gp'];
            const audioExtensions = ['mp3', 'wav', 'aac', 'flac', 'm4a', 'ogg', 'opus'];
            const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
            const fileBuffer = fs.readFileSync(filePath);
            if (videoExtensions.includes(fileExtension)) {
                // Send as video
                await sock.sendMessage(chatId, {
                    video: fileBuffer,
                    mimetype: 'video/mp4',
                    fileName: title,
                    caption: `âœ… *Download Complete!*\n\nðŸ“„ *File:* ${title}\nðŸ“Š *Size:* ${size}\n\n> *_Downloaded from TeraBox_*`
                }, { quoted: message });
            }
            else if (audioExtensions.includes(fileExtension)) {
                // Send as audio
                await sock.sendMessage(chatId, {
                    audio: fileBuffer,
                    mimetype: 'audio/mpeg',
                    fileName: title,
                    ptt: false
                }, { quoted: message });
                await sock.sendMessage(chatId, { text: `âœ… *Download Complete!*\n\nðŸ“„ *File:* ${title}\nðŸ“Š *Size:* ${size}` }, { quoted: message });
            }
            else if (imageExtensions.includes(fileExtension)) {
                // Send as image
                await sock.sendMessage(chatId, {
                    image: fileBuffer,
                    caption: `âœ… *Download Complete!*\n\nðŸ“„ *File:* ${title}\nðŸ“Š *Size:* ${size}`
                }, { quoted: message });
            }
            else {
                // Send as document
                await sock.sendMessage(chatId, {
                    document: fileBuffer,
                    mimetype: 'application/octet-stream',
                    fileName: title,
                    caption: `âœ… *Download Complete!*\n\nðŸ“„ *File:* ${title}\nðŸ“Š *Size:* ${size}\n\n> *_Downloaded from TeraBox_*`
                }, { quoted: message });
            }
            // Clean up
            fs.unlinkSync(filePath);
            // If there are multiple files, notify user
            if (totalFiles > 1) {
                await sock.sendMessage(chatId, { text: `â„¹ï¸ *Note:* This TeraBox link contains ${totalFiles} files.\nOnly the first file was downloaded.` }, { quoted: message });
            }
        }
        catch (error) {
            console.error('[TERABOX] Command Error:', error);
            let errorMsg = "âŒ *Download failed!*\n\n";
            if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
                errorMsg += "*Reason:* Timeout - File might be too large or connection is slow";
            }
            else if (error.code === 'ECONNRESET' || error.message?.includes('aborted')) {
                errorMsg += "*Reason:* Connection reset - The download was interrupted\nPlease try again.";
            }
            else if (error.response?.status === 429) {
                errorMsg += "*Reason:* Rate limit exceeded\nPlease wait a minute and try again.";
            }
            else if (error.response?.status === 403) {
                errorMsg += "*Reason:* Access forbidden - Link might be private or expired";
            }
            else if (error.response?.status === 404) {
                errorMsg += "*Reason:* File not found - Link might be invalid or deleted";
            }
            else {
                errorMsg += `*Error:* ${error.message || 'Unknown error'}`;
            }
            errorMsg += "\n\nðŸ’¡ *Tips:*\n- Make sure the link is public\n- Check if the link hasn't expired\n- Try with smaller files first\n- Wait 10-15 seconds between requests";
            await sock.sendMessage(chatId, { text: errorMsg }, { quoted: message });
        }
    }
};




