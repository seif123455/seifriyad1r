async function handleDemotionEvent(sock, groupId, participants, author) {
    try {
        if (!Array.isArray(participants) || participants.length === 0) {
            return;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        const demotedUsernames = await Promise.all(participants.map(async (jid) => {
            const jidString = typeof jid === 'string' ? jid : (jid.id || jid.toString());
            return `@${jidString.split('@')[0]}`;
        }));
        let demotedBy;
        const mentionList = participants.map(jid => {
            return typeof jid === 'string' ? jid : (jid.id || jid.toString());
        });
        if (author && author.length > 0) {
            const authorJid = typeof author === 'string' ? author : (author.id || author.toString());
            demotedBy = `@${authorJid.split('@')[0]}`;
            mentionList.push(authorJid);
        }
        else {
            demotedBy = 'System';
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        const demotionMessage = `*ã€Ž GROUP DEMOTION ã€*\n\n` +
            `ðŸ‘¤ *Demoted User${participants.length > 1 ? 's' : ''}:*\n` +
            `${demotedUsernames.map(name => `â€¢ ${name}`).join('\n')}\n\n` +
            `ðŸ‘‘ *Demoted By:* ${demotedBy}\n\n` +
            `ðŸ“… *Date:* ${new Date().toLocaleString()}`;
        await sock.sendMessage(groupId, {
            text: demotionMessage,
            mentions: mentionList
        });
    }
    catch (error) {
        console.error('Error handling demotion event:', error);
        if (error.data === 429) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
}
export default {
    command: 'إزالة ترقية',
    aliases: ['dmt', 'removeadmin', 'demote'],
    category: 'المشرفون',
    description: '',
    usage: '.ديموتي @مستخدم ور رد تو رسالة',
    groupOnly: true,
    adminOnly: true,
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const isBotAdmin = context.isBotAdmin;
        if (!isBotAdmin) {
            await sock.sendMessage(chatId, {
                text: 'âŒ *Please make the bot an admin first*'
            }, { quoted: message });
            return;
        }
        let userToDemote = [];
        const mentionedJids = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        if (mentionedJids && mentionedJids.length > 0) {
            userToDemote = mentionedJids;
        }
        else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
            userToDemote = [message.message.extendedTextMessage.contextInfo.participant];
        }
        if (userToDemote.length === 0) {
            await sock.sendMessage(chatId, {
                text: 'âŒ *Please mention a user or reply to their message*\n\nUsage: `.demote @user` or reply with `.demote`'
            }, { quoted: message });
            return;
        }
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            await sock.groupParticipantsUpdate(chatId, userToDemote, "demote");
            const usernames = await Promise.all(userToDemote.map(async (jid) => {
                return `@${jid.split('@')[0]}`;
            }));
            await new Promise(resolve => setTimeout(resolve, 1000));
            const demotionMessage = `*ã€Ž GROUP DEMOTION ã€*\n\n` +
                `ðŸ‘¤ *Demoted User${userToDemote.length > 1 ? 's' : ''}:*\n` +
                `${usernames.map(name => `â€¢ ${name}`).join('\n')}\n\n` +
                `ðŸ‘‘ *Demoted By:* @${message.key.participant ? message.key.participant.split('@')[0] : message.key.remoteJid.split('@')[0]}\n\n` +
                `ðŸ“… *Date:* ${new Date().toLocaleString()}`;
            await sock.sendMessage(chatId, {
                text: demotionMessage,
                mentions: [...userToDemote, message.key.participant || message.key.remoteJid]
            }, { quoted: message });
        }
        catch (error) {
            console.error('Error in demote command:', error);
            if (error.data === 429) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                try {
                    await sock.sendMessage(chatId, {
                        text: 'âŒ *Rate limit reached*\n\nPlease try again in a few seconds.'
                    }, { quoted: message });
                }
                catch (retryError) {
                    console.error('Error sending retry message:', retryError);
                }
            }
            else {
                try {
                    await sock.sendMessage(chatId, {
                        text: 'âŒ *Failed to demote user(s)*\n\nMake sure the bot has sufficient permissions.'
                    }, { quoted: message });
                }
                catch (sendError) {
                    console.error('Error sending error message:', sendError);
                }
            }
        }
    },
    handleDemotionEvent
};




