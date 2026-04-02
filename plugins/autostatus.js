import fs from 'fs';
import path from 'path';
import { dataFile } from '../lib/paths.js';
import store from '../lib/lightweight_store.js';

const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);
const configPath = dataFile('autoStatus.json');

if (!HAS_DB && !fs.existsSync(configPath)) {
    if (!fs.existsSync(path.dirname(configPath))) {
        fs.mkdirSync(path.dirname(configPath), { recursive: true });
    }
    fs.writeFileSync(configPath, JSON.stringify({
        enabled: false,
        reactOn: false
    }, null, 2));
}

const channelInfo = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '201144534147@newsletter',
            newsletterName: 'CRAZY-SEIF',
            serverMessageId: -1
        }
    }
};

async function readConfig() {
    try {
        if (HAS_DB) {
            const config = await store.getSetting('global', 'autoStatus');
            return config || { enabled: false, reactOn: false };
        } else {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            return {
                enabled: !!config.enabled,
                reactOn: !!config.reactOn
            };
        }
    } catch (error) {
        console.error('خطأ في قراءة إعدادات الحالة التلقائية:', error);
        return { enabled: false, reactOn: false };
    }
}

async function writeConfig(config) {
    try {
        if (HAS_DB) {
            await store.saveSetting('global', 'autoStatus', config);
        } else {
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        }
    } catch (error) {
        console.error('خطأ في حفظ إعدادات الحالة التلقائية:', error);
    }
}

async function isAutoStatusEnabled() {
    const config = await readConfig();
    return config.enabled;
}

async function isStatusReactionEnabled() {
    const config = await readConfig();
    return config.reactOn;
}

async function reactToStatus(sock, statusKey) {
    try {
        const enabled = await isStatusReactionEnabled();
        if (!enabled) return;
        
        await sock.relayMessage('status@broadcast', {
            reactionMessage: {
                key: {
                    remoteJid: 'status@broadcast',
                    id: statusKey.id,
                    participant: statusKey.participant || statusKey.remoteJid,
                    fromMe: false
                },
                text: '💚'
            }
        }, {
            messageId: statusKey.id,
            statusJidList: [statusKey.remoteJid, statusKey.participant || statusKey.remoteJid]
        });
        console.log('✅ تم التفاعل مع الحالة');
    } catch (error) {
        console.error('❌ خطأ في التفاعل مع الحالة:', error.message);
    }
}

async function handleStatusUpdate(sock, status) {
    try {
        const enabled = await isAutoStatusEnabled();
        if (!enabled) return;
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (status.messages && status.messages.length > 0) {
            const msg = status.messages[0];
            if (msg.key && msg.key.remoteJid === 'status@broadcast') {
                try {
                    await sock.readMessages([msg.key]);
                    console.log('✅ تم مشاهدة الحالة من الرسائل');
                    await reactToStatus(sock, msg.key);
                } catch (err) {
                    if (err.message?.includes('rate-overlimit')) {
                        console.log('⚠️ تم تجاوز الحد، انتظار قبل إعادة المحاولة...');
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        await sock.readMessages([msg.key]);
                    } else {
                        throw err;
                    }
                }
                return;
            }
        }
        
        if (status.key && status.key.remoteJid === 'status@broadcast') {
            try {
                await sock.readMessages([status.key]);
                console.log('✅ تم مشاهدة الحالة من المفتاح');
                await reactToStatus(sock, status.key);
            } catch (err) {
                if (err.message?.includes('rate-overlimit')) {
                    console.log('⚠️ تم تجاوز الحد، انتظار قبل إعادة المحاولة...');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    await sock.readMessages([status.key]);
                } else {
                    throw err;
                }
            }
            return;
        }
        
        if (status.reaction && status.reaction.key.remoteJid === 'status@broadcast') {
            try {
                await sock.readMessages([status.reaction.key]);
                console.log('✅ تم مشاهدة الحالة من التفاعل');
                await reactToStatus(sock, status.reaction.key);
            } catch (err) {
                if (err.message?.includes('rate-overlimit')) {
                    console.log('⚠️ تم تجاوز الحد، انتظار قبل إعادة المحاولة...');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    await sock.readMessages([status.reaction.key]);
                } else {
                    throw err;
                }
            }
        }
    } catch (error) {
        console.error('❌ خطأ في مشاهدة الحالة التلقائية:', error.message);
    }
}

export default {
    command: 'حالات',
    aliases: ['autostatus', 'autoview', 'statusview', 'حالة_تلقائي', 'مشاهدة_حالات'],
    category: 'owner',
    description: 'مشاهدة وتفاعل تلقائي مع حالات الواتساب',
    usage: '!حالات <on|off|تفاعل on|تفاعل off>',
    ownerOnly: true,
    
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        
        try {
            const config = await readConfig();
            
            if (!args || args.length === 0) {
                const viewStatus = config.enabled ? '✅ مفعل' : '❌ معطل';
                const reactStatus = config.reactOn ? '✅ مفعل' : '❌ معطل';
                
                await sock.sendMessage(chatId, {
                    text: `🔄 *إعدادات الحالات التلقائية*\n\n` +
                        `📱 *مشاهدة الحالات:* ${viewStatus}\n` +
                        `💫 *التفاعل مع الحالات:* ${reactStatus}\n` +
                        `🗄️ *التخزين:* ${HAS_DB ? 'قاعدة بيانات' : 'ملفات'}\n\n` +
                        `*الأوامر:*\n` +
                        `• \`!حالات on\` - تفعيل المشاهدة التلقائية\n` +
                        `• \`!حالات off\` - تعطيل المشاهدة التلقائية\n` +
                        `• \`!حالات تفاعل on\` - تفعيل التفاعل\n` +
                        `• \`!حالات تفاعل off\` - تعطيل التفاعل`,
                    ...channelInfo
                }, { quoted: message });
                return;
            }
            
            const command = args[0].toLowerCase();
            
            if (command === 'on') {
                config.enabled = true;
                await writeConfig(config);
                await sock.sendMessage(chatId, {
                    text: '✅ *تم تفعيل مشاهدة الحالات التلقائية!*\n\n' +
                        'سيقوم البوت الآن بمشاهدة جميع حالات جهات الاتصال.',
                    ...channelInfo
                }, { quoted: message });
                
            } else if (command === 'off') {
                config.enabled = false;
                await writeConfig(config);
                await sock.sendMessage(chatId, {
                    text: '❌ *تم تعطيل مشاهدة الحالات التلقائية!*\n\n' +
                        'لن يقوم البوت بمشاهدة الحالات تلقائياً.',
                    ...channelInfo
                }, { quoted: message });
                
            } else if (command === 'تفاعل' || command === 'react') {
                if (!args[1]) {
                    await sock.sendMessage(chatId, {
                        text: '❌ *الرجاء تحديد on/off للتفاعلات!*\n\n' +
                            'الاستخدام: `!حالات تفاعل on/off`',
                        ...channelInfo
                    }, { quoted: message });
                    return;
                }
                
                const reactCommand = args[1].toLowerCase();
                
                if (reactCommand === 'on') {
                    config.reactOn = true;
                    await writeConfig(config);
                    await sock.sendMessage(chatId, {
                        text: '💫 *تم تفعيل التفاعل مع الحالات!*\n\n' +
                            'سيقوم البوت بالتفاعل مع الحالات بـ 💚',
                        ...channelInfo
                    }, { quoted: message });
                    
                } else if (reactCommand === 'off') {
                    config.reactOn = false;
                    await writeConfig(config);
                    await sock.sendMessage(chatId, {
                        text: '❌ *تم تعطيل التفاعل مع الحالات!*\n\n' +
                            'لن يقوم البوت بالتفاعل مع الحالات.',
                        ...channelInfo
                    }, { quoted: message });
                    
                } else {
                    await sock.sendMessage(chatId, {
                        text: '❌ *أمر تفاعل غير صحيح!*\n\n' +
                            'الاستخدام: `!حالات تفاعل on/off`',
                        ...channelInfo
                    }, { quoted: message });
                }
                
            } else {
                await sock.sendMessage(chatId, {
                    text: '❌ *أمر غير صحيح!*\n\n' +
                        '*الاستخدام:*\n' +
                        '• `!حالات on/off` - تفعيل/تعطيل المشاهدة التلقائية\n' +
                        '• `!حالات تفاعل on/off` - تفعيل/تعطيل التفاعلات',
                    ...channelInfo
                }, { quoted: message });
            }
            
        } catch (error) {
            console.error('خطأ في أمر الحالات التلقائية:', error);
            await sock.sendMessage(chatId, {
                text: '❌ *حدث خطأ أثناء إدارة الحالات التلقائية!*\n\n' +
                    `الخطأ: ${error.message}`,
                ...channelInfo
            }, { quoted: message });
        }
    },
    handleStatusUpdate,
    isAutoStatusEnabled,
    isStatusReactionEnabled,
    reactToStatus,
    readConfig,
    writeConfig
};