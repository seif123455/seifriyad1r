import { handleWelcome } from '../lib/welcome.js';
import { isWelcomeOn, getWelcome } from '../lib/index.js';

export default {
    command: 'ØªØ±Ø­ÙŠØ¨',
    aliases: ['welcome', 'setwelcome', 'ØªØ±Ø­Ø§Ø¨'],
    category: 'Ø§Ù„Ù…Ø´Ø±ÙÙˆÙ†',
    description: 'Ø¥Ø¹Ø¯Ø§Ø¯ Ø±Ø³Ø§Ù„Ø© Ø§Ù„ØªØ±Ø­ÙŠØ¨ Ù„Ù„Ù…Ø¬Ù…ÙˆØ¹Ø©',
    usage: '!ØªØ±Ø­ÙŠØ¨ [ÙˆÙ†/ÙˆÙÙ/Ø±Ø³Ø§Ù„Ø©]',
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
    const groupDesc = groupMetadata.desc || 'Ù„Ø§ ÙŠÙˆØ¬Ø¯ ÙˆØµÙ';
    
    const channelInfo = {
        contextInfo: {
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '01144534147@newsletter',
                newsletterName: 'Crazy Seif',
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
                console.log('Ù„Ø§ ÙŠÙ…ÙƒÙ† Ø¬Ù„Ø¨ Ø§Ù„Ø§Ø³Ù…ØŒ Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø±Ù‚Ù… Ø§Ù„Ù‡Ø§ØªÙ');
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
                
                finalMessage = `â•­â•¼â”â‰ªâ€¢ðŸŽ‰ Ø¹Ø¶Ùˆ Ø¬Ø¯ÙŠØ¯ â€¢â‰«â”â•¾â•®\n` +
                    `â”ƒ Ù…Ø±Ø­Ø¨Ø§Ù‹ Ø¨Ùƒ @${displayName} ðŸ‘‹\n` +
                    `â”ƒ Ø¹Ø¯Ø¯ Ø§Ù„Ø£Ø¹Ø¶Ø§Ø¡: ${groupMetadata.participants.length}\n` +
                    `â”ƒ Ø§Ù„ÙˆÙ‚Øª: ${timeString} â°\n` +
                    `â•°â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â•¯\n\n` +
                    `*@${displayName}* Ø§Ù‡Ù„Ø§Ù‹ Ø¨Ùƒ ÙÙŠ *${groupName}*! ðŸŽ‰\n\n` +
                    `*ðŸ“ ÙˆØµÙ Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹Ø©:*\n${groupDesc}\n\n` +
                    `> ðŸ”¥ *Crazy Seif BOT*`;
            }
            
            try {
                let profilePicUrl = `https://img.pyrocdn.com/dbKUgahg.png`;
                try {
                    const profilePic = await sock.profilePictureUrl(participantString, 'image');
                    if (profilePic) {
                        profilePicUrl = profilePic;
                    }
                } catch (profileError) {
                    console.log('Ù„Ø§ ÙŠÙ…ÙƒÙ† Ø¬Ù„Ø¨ Ø§Ù„ØµÙˆØ±Ø© Ø§Ù„Ø´Ø®ØµÙŠØ©ØŒ Ø§Ø³ØªØ®Ø¯Ø§Ù… ØµÙˆØ±Ø© Ø§ÙØªØ±Ø§Ø¶ÙŠØ©');
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
                console.log('ÙØ´Ù„ Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„ØµÙˆØ±Ø©ØŒ Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ù†Øµ Ø§Ù„Ø¹Ø§Ø¯ÙŠ');
            }
            
            await sock.sendMessage(id, {
                text: finalMessage,
                mentions: [participantString],
                ...channelInfo
            });
            
        } catch (error) {
            console.error('Ø®Ø·Ø£ ÙÙŠ Ø¥Ø±Ø³Ø§Ù„ Ø±Ø³Ø§Ù„Ø© Ø§Ù„ØªØ±Ø­ÙŠØ¨:', error);
            
            const participantString = typeof participant === 'string' ? participant : (participant.id || participant.toString());
            const user = participantString.split('@')[0];
            
            let fallbackMessage;
            if (customMessage) {
                fallbackMessage = customMessage
                    .replace(/{user}/g, `@${user}`)
                    .replace(/{group}/g, groupName)
                    .replace(/{description}/g, groupDesc);
            } else {
                fallbackMessage = `ðŸŽ‰ Ù…Ø±Ø­Ø¨Ø§Ù‹ @${user} ÙÙŠ ${groupName}! ðŸŽ‰\nðŸ”¥ Crazy Seif BOT`;
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

