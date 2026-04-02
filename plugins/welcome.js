import { handleWelcome } from '../lib/welcome.js';
import { isWelcomeOn, getWelcome } from '../lib/index.js';

export default {
    command: 'ترحيب',
    aliases: ['welcome', 'setwelcome', 'ترحاب'],
    category: 'admin',
    description: 'إعداد رسالة الترحيب للمجموعة',
    usage: '!ترحيب [on/off/رسالة]',
    groupOnly: true,
    adminOnly: true,
    
    async handler(sock, message, args, context) {
        const { chatId } = context;
        const matchText = args.join(' ');
        await handleWelcome(sock, chatId, message, matchText);
    }
};

async function handleJoinEvent(sock, id, participants) {
    const isWelcomeEnabled = await isWelcomeOn(id);
    if (!isWelcomeEnabled) return;
    
    const customMessage = await getWelcome(id);
    const groupMetadata = await sock.groupMetadata(id);
    const groupName = groupMetadata.subject;
    const groupDesc = groupMetadata.desc || 'لا يوجد وصف';
    
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
    
    for (const participant of participants) {
        try {
            const participantString = typeof participant === 'string' ? participant : (participant.id || participant.toString());
            const user = participantString.split('@')[0];
            let displayName = user;
            
            try {
                const contact = await sock.getBusinessProfile(participantString);
                if (contact && contact.name) {
                    displayName = contact.name;
                } else {
                    const groupParticipants = groupMetadata.participants;
                    const userParticipant = groupParticipants.find((p) => p.id === participantString);
                    if (userParticipant && userParticipant.name) {
                        displayName = userParticipant.name;
                    }
                }
            } catch (nameError) {
                console.log('لا يمكن جلب الاسم، استخدام رقم الهاتف');
            }
            
            let finalMessage;
            
            if (customMessage) {
                finalMessage = customMessage
                    .replace(/{user}/g, `@${displayName}`)
                    .replace(/{group}/g, groupName)
                    .replace(/{description}/g, groupDesc);
            } else {
                const now = new Date();
                const timeString = now.toLocaleString('ar-EG', {
                    month: '2-digit',
                    day: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true
                });
                
                finalMessage = `╭╼━≪•🎉 عضو جديد •≫━╾╮\n` +
                    `┃ مرحباً بك @${displayName} 👋\n` +
                    `┃ عدد الأعضاء: ${groupMetadata.participants.length}\n` +
                    `┃ الوقت: ${timeString} ⏰\n` +
                    `╰━━━━━━━━━━━━━━━╯\n\n` +
                    `*@${displayName}* اهلاً بك في *${groupName}*! 🎉\n\n` +
                    `*📝 وصف المجموعة:*\n${groupDesc}\n\n` +
                    `> 🔥 *CRAZY-SEIF BOT*`;
            }
            
            try {
                let profilePicUrl = `https://img.pyrocdn.com/dbKUgahg.png`;
                try {
                    const profilePic = await sock.profilePictureUrl(participantString, 'image');
                    if (profilePic) {
                        profilePicUrl = profilePic;
                    }
                } catch (profileError) {
                    console.log('لا يمكن جلب الصورة الشخصية، استخدام صورة افتراضية');
                }
                
                const apiUrl = `https://api.some-random-api.com/welcome/img/2/gaming3?type=join&textcolor=green&username=${encodeURIComponent(displayName)}&guildName=${encodeURIComponent(groupName)}&memberCount=${groupMetadata.participants.length}&avatar=${encodeURIComponent(profilePicUrl)}`;
                const response = await fetch(apiUrl);
                
                if (response.ok) {
                    const imageBuffer = Buffer.from(await response.arrayBuffer());
                    await sock.sendMessage(id, {
                        image: imageBuffer,
                        caption: finalMessage,
                        mentions: [participantString],
                        ...channelInfo
                    });
                    continue;
                }
            } catch (imageError) {
                console.log('فشل إنشاء الصورة، استخدام النص العادي');
            }
            
            await sock.sendMessage(id, {
                text: finalMessage,
                mentions: [participantString],
                ...channelInfo
            });
            
        } catch (error) {
            console.error('خطأ في إرسال رسالة الترحيب:', error);
            
            const participantString = typeof participant === 'string' ? participant : (participant.id || participant.toString());
            const user = participantString.split('@')[0];
            
            let fallbackMessage;
            if (customMessage) {
                fallbackMessage = customMessage
                    .replace(/{user}/g, `@${user}`)
                    .replace(/{group}/g, groupName)
                    .replace(/{description}/g, groupDesc);
            } else {
                fallbackMessage = `🎉 مرحباً @${user} في ${groupName}! 🎉\n🔥 CRAZY-SEIF BOT`;
            }
            
            await sock.sendMessage(id, {
                text: fallbackMessage,
                mentions: [participantString],
                ...channelInfo
            });
        }
    }
}

export { handleJoinEvent };