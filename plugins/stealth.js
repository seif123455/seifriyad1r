import store from '../lib/lightweight_store.js';
export default {
    command: 'ستيالته',
    aliases: ['alwaysonline', 'stealthmode', 'stealth'],
    category: 'المالك',
    description: 'تبديل ونليني حالة - بوت ويلل نوت إرسال بريسينكي وبداتيس يف وفف',
    usage: '.ستيالته <ون|وفف>',
    ownerOnly: true,
    async handler(sock, message, args, context) {
        const { chatId } = context;
        const action = args[0]?.toLowerCase();
        if (!action || !['on', 'off'].includes(action)) {
            const currentState = await store.getSetting('global', 'stealthMode');
            const status = currentState?.enabled ? 'ON' : 'OFF';
            let autotypingWarning = '';
            try {
                const autotypingState = await store.getSetting('global', 'autotyping');
                if (autotypingState?.enabled && currentState?.enabled) {
                    autotypingWarning = '\n\nâš ï¸ *Autotyping is enabled* but will be blocked by stealth mode.';
                }
            }
            catch (e) { }
            let autoreadWarning = '';
            try {
                const autoreadState = await store.getSetting('global', 'autoread');
                if (autoreadState?.enabled && currentState?.enabled) {
                    autoreadWarning = '\nâš ï¸ *Autoread is enabled* but will be blocked by stealth mode.';
                }
            }
            catch (e) { }
            return await sock.sendMessage(chatId, {
                text: `ðŸ‘» *Stealth Mode Status:* ${status}\n\n*Usage:* .ستيالته <ون|وفف>\n\n*What it does:*\nâ€¢ Blocks all presence updates (typing, online, last seen)\nâ€¢ Makes the bot completely invisible\n\n*When enabled:*\nâœ“ No "typing..." indicator\nâœ“ No "online" status\nâœ“ Complete stealth mode${autotypingWarning}${autoreadWarning}`
            }, { quoted: message });
        }
        const enabled = action === 'on';
        await store.saveSetting('global', 'stealthMode', { enabled });
        let warnings = '';
        if (enabled) {
            try {
                const autotypingState = await store.getSetting('global', 'autotyping');
                const autoreadState = await store.getSetting('global', 'autoread');
                if (autotypingState?.enabled || autoreadState?.enabled) {
                    warnings = '\n\n*âš ï¸ Note:*\n';
                    if (autotypingState?.enabled)
                        warnings += 'â€¢ Autotyping is enabled but will be blocked\n';
                    if (autoreadState?.enabled)
                        warnings += 'â€¢ Autoread is enabled but will be blocked\n';
                }
            }
            catch (e) { }
        }
        await sock.sendMessage(chatId, {
            text: `ðŸ‘» Stealth mode has been turned *${enabled ? 'ON' : 'OFF'}*\n\n${enabled ? 'âœ“ Bot is now in complete stealth mode\nâœ“ No presence updates\nâœ“ No typing indicators' : 'âœ“ Presence updates enabled\nâœ“ Typing indicators enabled (if autotyping is on)'}${warnings}`
        }, { quoted: message });
    }
};



