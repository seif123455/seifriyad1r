const words = ['javascript', 'bot', 'hangman', 'whatsapp', 'nodejs', 'python', 'programming', 'developer', 'computer', 'algorithm'];
const hangmanGames = {};
function guessLetter(sock, chatId, letter) {
    if (!hangmanGames[chatId]) {
        sock.sendMessage(chatId, { text: 'âŒ *No game in progress*\n\nStart a new game with `.hangman`' });
        return;
    }
    const game = hangmanGames[chatId];
    const { word, guessedLetters, maskedWord, maxWrongGuesses } = game;
    if (guessedLetters.includes(letter)) {
        sock.sendMessage(chatId, { text: `âš ï¸ *You already guessed "${letter}"*\n\nTry another letter.` });
        return;
    }
    guessedLetters.push(letter);
    if (word.includes(letter)) {
        for (let i = 0; i < word.length; i++) {
            if (word[i] === letter) {
                maskedWord[i] = letter;
            }
        }
        sock.sendMessage(chatId, { text: `âœ… *Good guess!*\n\n${maskedWord.join(' ')}` });
        if (!maskedWord.includes('_')) {
            sock.sendMessage(chatId, { text: `ðŸŽ‰ *Congratulations!*\n\nYou guessed the word: *${word}*` });
            delete hangmanGames[chatId];
        }
    }
    else {
        game.wrongGuesses += 1;
        sock.sendMessage(chatId, { text: `âŒ *Wrong guess!*\n\nYou have *${maxWrongGuesses - game.wrongGuesses}* tries left.\n\n${maskedWord.join(' ')}` });
        if (game.wrongGuesses >= maxWrongGuesses) {
            sock.sendMessage(chatId, { text: `ðŸ’€ *Game over!*\n\nThe word was: *${word}*` });
            delete hangmanGames[chatId];
        }
    }
}
export default {
    command: 'الرجل المشنوق',
    aliases: ['hang', 'hm', 'hangman'],
    category: 'ألعاب',
    description: 'تشغيل هانجمان وورد جويسسينج لعبة',
    usage: '.هانجمان تو بدء, تهين .جويسس <ليتتير>',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const word = words[Math.floor(Math.random() * words.length)];
        const maskedWord = '_ '.repeat(word.length).trim();
        hangmanGames[chatId] = {
            word,
            maskedWord: maskedWord.split(' '),
            guessedLetters: [],
            wrongGuesses: 0,
            maxWrongGuesses: 6,
        };
        await sock.sendMessage(chatId, {
            text: `ðŸŽ® *HANGMAN GAME STARTED!*\n\n` +
                `The word is: ${maskedWord}\n\n` +
                `*How to play:*\n` +
                `â€¢ Use \`.guess <letter>\` to guess\n` +
                `â€¢ You have 6 wrong guesses allowed\n` +
                `â€¢ Guess the word before running out of tries!\n\n` +
                `Good luck! ðŸ€`
        }, { quoted: message });
    },
    guessLetter
};



