export default {
    command: 'Ø¨ÙˆÙƒÙŠØ¯ÙŠÙƒØ³',
    aliases: ['pokemon', 'poke', 'pokedex'],
    category: 'Ù…Ø¹Ù„ÙˆÙ…Ø§Øª',
    description: 'Ø§Ø­ØµÙ„ Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ø¨ÙˆÙˆØª Ø§ Ø¨ÙˆÙƒÃ©Ù…ÙˆÙ†',
    usage: '.Ø¨ÙˆÙƒÙŠØ¯ÙŠÙƒØ³ <Ø¨ÙˆÙƒÙŠÙ…ÙˆÙ† Ù†Ø§Ù…ÙŠ>',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const text = args.join(' ').trim();
        if (!text) {
            return await sock.sendMessage(chatId, {
                text: '*Please provide a PokÃ©mon name to search for.*\nExample: `.pokedex pikachu`'
            }, { quoted: message });
        }
        try {
            const url = `https://some-random-api.com/pokemon/pokedex?pokemon=${encodeURIComponent(text)}`;
            const res = await fetch(url);
            const json = await res.json();
            if (!res.ok)
                throw json.error || 'Unknown error';
            const messageText = `
*â‰¡ Name:* ${json.name}
*â‰¡ ID:* ${json.id}
*â‰¡ Type:* ${Array.isArray(json.type) ? json.type.join(', ') : json.type}
*â‰¡ Abilities:* ${Array.isArray(json.abilities) ? json.abilities.join(', ') : json.abilities}
*â‰¡ Species:* ${Array.isArray(json.species) ? json.species.join(', ') : json.species}
*â‰¡ Height:* ${json.height}
*â‰¡ Weight:* ${json.weight}
*â‰¡ Experience:* ${json.base_experience}
*â‰¡ Description:* ${json.description}
      `.trim();
            await sock.sendMessage(chatId, { text: messageText, quoted: message });
        }
        catch (error) {
            console.error('Pokedex Command Error:', error);
            await sock.sendMessage(chatId, { text: `âŒ Error: ${error}` }, { quoted: message });
        }
    }
};


