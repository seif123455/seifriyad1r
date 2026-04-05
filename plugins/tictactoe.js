import TicTacToe from '../lib/tictactoe.js';
const games = {};
export async function handleTicTacToeMove(sock, chatId, senderId, text) {
    try {
        const room = Object.values(games).find((room) => room.id.startsWith('tictactoe') &&
            [room.game.playerX, room.game.playerO].includes(senderId) &&
            room.state === 'PLAYING');
        if (!room)
            return;
        const isSurrender = /^(surrender|give up)$/i.test(text);
        if (!isSurrender && !/^[1-9]$/.test(text))
            return;
        if (senderId !== room.game.currentTurn && !isSurrender) {
            await sock.sendMessage(chatId, {
                text: 'âŒ Not your turn!'
            });
            return;
        }
        const ok = isSurrender ? true : room.game.turn(senderId === room.game.playerO, parseInt(text, 10) - 1);
        if (!ok) {
            await sock.sendMessage(chatId, {
                text: 'âŒ Invalid move! That position is already taken.'
            });
            return;
        }
        let winner = room.game.winner;
        const isTie = room.game.turns === 9;
        const arr = room.game.render().map((v) => ({
            'X': 'âŽ',
            'O': 'â­•',
            '1': '1ï¸âƒ£',
            '2': '2ï¸âƒ£',
            '3': '3ï¸âƒ£',
            '4': '4ï¸âƒ£',
            '5': '5ï¸âƒ£',
            '6': '6ï¸âƒ£',
            '7': '7ï¸âƒ£',
            '8': '8ï¸âƒ£',
            '9': '9ï¸âƒ£',
        }[v] || v));
        if (isSurrender) {
            winner = senderId === room.game.playerX ? room.game.playerO : room.game.playerX;
            await sock.sendMessage(chatId, {
                text: `ðŸ³ï¸ @${senderId.split('@')[0]} has surrendered! @${winner.split('@')[0]} wins the game!`,
                mentions: [senderId, winner]
            });
            delete games[room.id];
            return;
        }
        let gameStatus;
        if (winner) {
            gameStatus = `ðŸŽ‰ @${winner.split('@')[0]} wins the game!`;
        }
        else if (isTie) {
            gameStatus = `ðŸ¤ Game ended in a draw!`;
        }
        else {
            gameStatus = `ðŸŽ² Turn: @${room.game.currentTurn.split('@')[0]} (${senderId === room.game.playerX ? 'âŽ' : 'â­•'})`;
        }
        const str = `
ðŸŽ® *TicTacToe Game*

${gameStatus}

${arr.slice(0, 3).join('')}
${arr.slice(3, 6).join('')}
${arr.slice(6).join('')}

â–¢ Player âŽ: @${room.game.playerX.split('@')[0]}
â–¢ Player â­•: @${room.game.playerO.split('@')[0]}

${!winner && !isTie ? 'â€¢ Type a number (1-9) to make your move\nâ€¢ Type *surrender* to give up' : ''}
`;
        const mentions = [
            room.game.playerX,
            room.game.playerO,
            ...(winner ? [winner] : [room.game.currentTurn])
        ];
        await sock.sendMessage(room.x, {
            text: str,
            mentions
        });
        if (room.x !== room.o) {
            await sock.sendMessage(room.o, {
                text: str,
                mentions
            });
        }
        if (winner || isTie) {
            delete games[room.id];
        }
    }
    catch (error) {
        console.error('Error in tictactoe move:', error);
    }
}
export default {
    command: 'إكس-أو',
    aliases: ['ttt', 'xo', 'tictactoe'],
    category: 'ألعاب',
    description: 'تشغيل تيكتاكتوي لعبة ويته انوتهير مستخدم',
    usage: '.تيكتاكتوي [رووم نامي]',
    groupOnly: true,
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const senderId = context.senderId || message.key.participant || message.key.remoteJid;
        const text = args.join(' ').trim();
        try {
            if (Object.values(games).find((room) => room.id.startsWith('tictactoe') &&
                [room.game.playerX, room.game.playerO].includes(senderId))) {
                await sock.sendMessage(chatId, {
                    text: '*You are already in a game*\n\nType *surrender* to quit the current game first.'
                }, { quoted: message });
                return;
            }
            let room = Object.values(games).find((room) => room.state === 'WAITING' &&
                (text ? room.name === text : true));
            if (room) {
                room.o = chatId;
                room.game.playerO = senderId;
                room.state = 'PLAYING';
                const arr = room.game.render().map((v) => ({
                    'X': 'âŽ',
                    'O': 'â­•',
                    '1': '1ï¸âƒ£',
                    '2': '2ï¸âƒ£',
                    '3': '3ï¸âƒ£',
                    '4': '4ï¸âƒ£',
                    '5': '5ï¸âƒ£',
                    '6': '6ï¸âƒ£',
                    '7': '7ï¸âƒ£',
                    '8': '8ï¸âƒ£',
                    '9': '9ï¸âƒ£',
                }[v] || v));
                const str = `
ðŸŽ® *TicTacToe Game Started!*

Waiting for @${room.game.currentTurn.split('@')[0]} to play...

${arr.slice(0, 3).join('')}
${arr.slice(3, 6).join('')}
${arr.slice(6).join('')}

â–¢ *Room ID:* ${room.id}
â–¢ *Rules:*
â€¢ Make 3 rows of symbols vertically, horizontally or diagonally to win
â€¢ Type a number (1-9) to place your symbol
â€¢ Type *surrender* to give up
`;
                await sock.sendMessage(chatId, {
                    text: str,
                    mentions: [room.game.currentTurn, room.game.playerX, room.game.playerO]
                }, { quoted: message });
            }
            else {
                room = {
                    id: `tictactoe-${ +new Date}`,
                    x: chatId,
                    o: '',
                    game: new TicTacToe(senderId, 'o'),
                    state: 'WAITING'
                };
                if (text)
                    room.name = text;
                await sock.sendMessage(chatId, {
                    text: `*Waiting for opponent*\n\nType \`.tictactoe ${text || ''}\` to join this game!\n\nPlayer âŽ: @${senderId.split('@')[0]}`,
                    mentions: [senderId]
                }, { quoted: message });
                games[room.id] = room;
            }
        }
        catch (error) {
            console.error('Error in tictactoe command:', error);
            await sock.sendMessage(chatId, {
                text: 'âŒ *Error starting game*\n\nPlease try again later.'
            }, { quoted: message });
        }
    },
    handleTicTacToeMove,
    games
};



