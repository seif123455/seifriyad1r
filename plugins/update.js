/*****************************************************************************
 *                                                                           *
 *                     Developed By Crazy Seif                               *
 *                                                                           *
 *  ðŸ“ž  WhatsApp : 01144534147                                              *
 *                                                                           *
 *    Â© 2026 Crazy Seif. All rights reserved.                               *
 *                                                                           *
 *    Description: This file is part of the Crazy Seif BOT Project.          *
 *                                                                           *
 *****************************************************************************/
import config from '../config.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import https from 'https';

function run(cmd) {
    return new Promise((resolve, reject) => {
        exec(cmd, { windowsHide: true }, (err, stdout, stderr) => {
            if (err) return reject(new Error((stderr || stdout || err.message || '').toString()));
            resolve((stdout || '').toString());
        });
    });
}

async function hasGitRepo() {
    const gitDir = path.join(process.cwd(), '.git');
    if (!fs.existsSync(gitDir)) return false;
    try {
        await run('git --version');
        return true;
    } catch { return false; }
}

async function updateViaGit() {
    const oldRev = String(await run('git rev-parse HEAD').catch(() => 'unknown')).trim();
    await run('git fetch --all --prune');
    const newRev = String(await run('git rev-parse origin/main')).trim();
    const alreadyUpToDate = oldRev === newRev;
    const commits = alreadyUpToDate ? '' : await run(`git log --pretty=format:"%h %s (%an)" ${oldRev}..${newRev}`).catch(() => '');
    const files = alreadyUpToDate ? '' : await run(`git diff --name-status ${oldRev} ${newRev}`).catch(() => '');
    await run(`git reset --hard ${newRev}`);
    await run('git clean -fd');
    return { oldRev, newRev, alreadyUpToDate, commits, files };
}

function downloadFile(url, dest, visited = new Set()) {
    return new Promise((resolve, reject) => {
        try {
            if (visited.has(url) || visited.size > 5) return reject(new Error('ØªØ­ÙˆÙŠÙ„Ø§Øª ÙƒØ«ÙŠØ±Ø© Ø¬Ø¯Ø§Ù‹'));
            visited.add(url);
            const useHttps = url.startsWith('https://');
            const http = require('http');
            const client = useHttps ? https : http;
            const req = client.get(url, {
                headers: { 'User-Agent': 'Crazy Seif-BOT-Updater/1.0', 'Accept': '*/*' }
            }, (res) => {
                if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
                    const location = res.headers.location;
                    if (!location) return reject(new Error(`HTTP ${res.statusCode} Ø¨Ø¯ÙˆÙ† Ù…ÙˆÙ‚Ø¹`));
                    const nextUrl = new URL(location, url).toString();
                    res.resume();
                    return downloadFile(nextUrl, dest, visited).then(resolve).catch(reject);
                }
                if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
                const file = fs.createWriteStream(dest);
                res.pipe(file);
                file.on('finish', () => file.close(resolve));
                file.on('error', (err) => {
                    try { file.close(() => { }); } catch { }
                    fs.unlink(dest, () => reject(err));
                });
            });
            req.on('error', (err) => { fs.unlink(dest, () => reject(err)); });
        } catch (e) { reject(e); }
    });
}

async function extractZip(zipPath, outDir) {
    if (process.platform === 'win32') {
        const cmd = `powershell -NoProfile -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${outDir.replace(/\\/g, '/')}' -Force"`;
        await run(cmd);
        return;
    }
    try {
        await run('command -v unzip');
        await run(`unzip -o '${zipPath}' -d '${outDir}'`);
        return;
    } catch { }
    try {
        await run('command -v 7z');
        await run(`7z x -y '${zipPath}' -o'${outDir}'`);
        return;
    } catch { }
    try {
        await run('busybox unzip -h');
        await run(`busybox unzip -o '${zipPath}' -d '${outDir}'`);
        return;
    } catch { }
    throw new Error("Ù„Ø§ ØªÙˆØ¬Ø¯ Ø£Ø¯Ø§Ø© ÙÙƒ Ø¶ØºØ· (unzip/7z/busybox).");
}

function copyRecursive(src, dest, ignore = [], relative = '', outList = []) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
        if (ignore.includes(entry)) continue;
        const s = path.join(src, entry);
        const d = path.join(dest, entry);
        const stat = fs.lstatSync(s);
        if (stat.isDirectory()) {
            copyRecursive(s, d, ignore, path.join(relative, entry), outList);
        } else {
            fs.copyFileSync(s, d);
            if (outList) outList.push(path.join(relative, entry).replace(/\\/g, '/'));
        }
    }
}

async function updateViaZip(sock, chatId, message, zipOverride) {
    const zipUrl = (zipOverride || config.updateZipUrl || process.env.UPDATE_ZIP_URL || '').trim();
    if (!zipUrl) throw new Error('Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ø±Ø§Ø¨Ø· ZIP. Ù‚Ù… Ø¨ØªØ¹ÙŠÙŠÙ† config.updateZipUrl Ø£Ùˆ UPDATE_ZIP_URL');
    
    const tmpDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    const zipPath = path.join(tmpDir, 'update.zip');
    await downloadFile(zipUrl, zipPath);
    const extractTo = path.join(tmpDir, 'update_extract');
    if (fs.existsSync(extractTo)) fs.rmSync(extractTo, { recursive: true, force: true });
    await extractZip(zipPath, extractTo);
    const [root] = fs.readdirSync(extractTo).map(n => path.join(extractTo, n));
    const srcRoot = fs.existsSync(root) && fs.lstatSync(root).isDirectory() ? root : extractTo;
    const ignore = ['node_modules', '.git', 'session', 'tmp', 'tmp/', 'temp', 'data', 'baileys_store.json'];
    const copied = [];
    let preservedOwner = null;
    let preservedBotOwner = null;
    try {
        const currentSettings = (await import('../config.js')).default;
        preservedOwner = currentSettings && currentSettings.ownerNumber ? String(currentSettings.ownerNumber) : null;
        preservedBotOwner = currentSettings && currentSettings.botOwner ? String(currentSettings.botOwner) : null;
    } catch { }
    copyRecursive(srcRoot, process.cwd(), ignore, '', copied);
    if (preservedOwner) {
        try {
            const settingsPath = path.join(process.cwd(), 'config.js');
            if (fs.existsSync(settingsPath)) {
                let text = fs.readFileSync(settingsPath, 'utf8');
                text = text.replace(/ownerNumber:\s*'[^']*'/, `ownerNumber: '${preservedOwner}'`);
                if (preservedBotOwner) text = text.replace(/botOwner:\s*'[^']*'/, `botOwner: '${preservedBotOwner}'`);
                fs.writeFileSync(settingsPath, text);
            }
        } catch { }
    }
    try { fs.rmSync(extractTo, { recursive: true, force: true }); } catch { }
    try { fs.rmSync(zipPath, { force: true }); } catch { }
    return { copiedFiles: copied };
}

async function restartProcess() {
    try {
        const { existsSync } = await import('fs');
        if (existsSync('/.dockerenv')) {
            setTimeout(() => process.exit(1), 500);
            return;
        }
    } catch { }
    try {
        await run('pm2 restart all');
        return;
    } catch { }
    try {
        const { spawn } = await import('child_process');
        const child = spawn(process.execPath, process.argv.slice(1), {
            detached: true, stdio: 'ignore', cwd: process.cwd(), env: process.env
        });
        child.unref();
        setTimeout(() => process.exit(0), 1500);
        return;
    } catch { }
    setTimeout(() => process.exit(0), 500);
}

export default {
    command: 'ØªØ­Ø¯ÙŠØ«',
    aliases: ['update', 'upgrade', 'restart', 'ØªØ·ÙˆÙŠØ±'],
    category: 'Ø§Ù„Ù…Ø§Ù„Ùƒ',
    description: 'ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø¨ÙˆØª Ù…Ù† Ø¬ÙŠØª Ø£Ùˆ Ø²ÙŠØ¨ Ø¯ÙˆÙ† Ø¥ÙŠÙ‚Ø§ÙÙ‡',
    usage: '!ØªØ­Ø¯ÙŠØ« [Ø±Ø§Ø¨Ø·_Ø²ÙŠØ¨]',
    ownerOnly: true,
    
    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        
        try {
            await sock.sendMessage(chatId, {
                text: 'ðŸ”„ Ø¬Ø§Ø±ÙŠ ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø¨ÙˆØªØŒ ÙŠØ±Ø¬Ù‰ Ø§Ù„Ø§Ù†ØªØ¸Ø§Ø±â€¦',
                ...channelInfo
            }, { quoted: message });
            
            let changesSummary = '';
            
            if (await hasGitRepo()) {
                const { oldRev, newRev, alreadyUpToDate, commits, files } = await updateViaGit();
                
                if (alreadyUpToDate) {
                    changesSummary = `âœ… Ø§Ù„Ø¨ÙˆØª Ù…Ø­Ø¯Ø« Ø¨Ø§Ù„ÙØ¹Ù„\nØ§Ù„Ù†Ø³Ø®Ø© Ø§Ù„Ø­Ø§Ù„ÙŠØ©: ${newRev.substring(0, 7)}`;
                } else {
                    changesSummary = `âœ… ØªÙ… Ø§Ù„ØªØ­Ø¯ÙŠØ« Ø¨Ù†Ø¬Ø§Ø­!\n\n`;
                    changesSummary += `ðŸ“Œ Ø§Ù„Ù‚Ø¯ÙŠÙ…: ${oldRev.substring(0, 7)}\n`;
                    changesSummary += `ðŸ“Œ Ø§Ù„Ø¬Ø¯ÙŠØ¯: ${newRev.substring(0, 7)}\n\n`;
                    if (commits) {
                        const commitLines = String(commits).split('\n').slice(0, 5);
                        changesSummary += `ðŸ“ Ø¢Ø®Ø± Ø§Ù„ØªØ­Ø¯ÙŠØ«Ø§Øª:\n${commitLines.map(c => `â€¢ ${c}`).join('\n')}\n\n`;
                    }
                    if (files) {
                        const fileLines = String(files).split('\n').slice(0, 10);
                        changesSummary += `ðŸ“ Ø§Ù„Ù…Ù„ÙØ§Øª Ø§Ù„Ù…ØªØºÙŠØ±Ø©:\n${fileLines.map(f => `â€¢ ${f}`).join('\n')}`;
                        if (String(files).split('\n').length > 10) changesSummary += `\n... Ùˆ ${String(files).split('\n').length - 10} Ù…Ù„ÙØ§Øª Ø£Ø®Ø±Ù‰`;
                    }
                }
                await run('npm install --no-audit --no-fund');
            } else {
                const zipOverride = args[0] || null;
                const { copiedFiles } = await updateViaZip(sock, chatId, message, zipOverride);
                changesSummary = `âœ… ØªÙ… Ø§Ù„ØªØ­Ø¯ÙŠØ« Ù…Ù† ZIP!\n\n`;
                changesSummary += `ðŸ“ Ø¹Ø¯Ø¯ Ø§Ù„Ù…Ù„ÙØ§Øª Ø§Ù„Ù…Ø­Ø¯Ø«Ø©: ${copiedFiles.length}\n\n`;
                if (copiedFiles.length > 0) {
                    const shown = copiedFiles.slice(0, 10);
                    changesSummary += `Ø¢Ø®Ø± Ø§Ù„ØªØºÙŠÙŠØ±Ø§Øª:\n${shown.map(f => `â€¢ ${f}`).join('\n')}`;
                    if (copiedFiles.length > 10) changesSummary += `\n... Ùˆ ${copiedFiles.length - 10} Ù…Ù„ÙØ§Øª Ø£Ø®Ø±Ù‰`;
                }
            }
            
            try {
                delete require.cache[require.resolve('../config')];
                const newSettings = (await import('../config.js')).default;
                const v = newSettings.version || 'ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙ';
                changesSummary += `\n\nðŸ”– Ø§Ù„Ø¥ØµØ¯Ø§Ø±: ${v}`;
            } catch { }
            
            await sock.sendMessage(chatId, {
                text: `${changesSummary}\n\nâ™»ï¸ Ø¬Ø§Ø±ÙŠ Ø¥Ø¹Ø§Ø¯Ø© ØªØ´ØºÙŠÙ„ Ø§Ù„Ø¨ÙˆØª...`,
                ...channelInfo
            }, { quoted: message });
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            await restartProcess();
            
        } catch (err) {
            console.error('ÙØ´Ù„ Ø§Ù„ØªØ­Ø¯ÙŠØ«:', err);
            await sock.sendMessage(chatId, {
                text: `âŒ ÙØ´Ù„ Ø§Ù„ØªØ­Ø¯ÙŠØ«:\n${String(err.message || err)}`,
                ...channelInfo
            }, { quoted: message });
        }
    }
};

/*****************************************************************************
 *                                                                           *
 *                     Developed By Crazy Seif                               *
 *                                                                           *
 *  ðŸ“ž  WhatsApp : 01144534147                                              *
 *                                                                           *
 *    Â© 2026 Crazy Seif. All rights reserved.                               *
 *                                                                           *
 *    Description: This file is part of the Crazy Seif BOT Project.          *
 *                                                                           *
 *****************************************************************************/

