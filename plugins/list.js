import config from '../config.js';
import commandHandler from '../lib/commandHandler.js';
import path from 'path';
import fs from 'fs';

function formatTime() {
  const now = new Date();
  const options = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: config.timeZone || 'Africa/Cairo',
  };
  return now.toLocaleTimeString('en-US', options);
}

const categoryMap = {
  general: 'Ø¹Ø§Ù…',
  owner: 'Ø§Ù„Ù…Ø§Ù„Ùƒ',
  admin: 'Ø§Ù„Ù…Ø´Ø±ÙÙˆÙ†',
  group: 'Ø§Ù„Ù…Ø¬Ù…ÙˆØ¹Ø©',
  download: 'Ø§Ù„ØªØ­Ù…ÙŠÙ„',
  ai: 'Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ',
  search: 'Ø§Ù„Ø¨Ø­Ø«',
  fun: 'ØªØ³Ù„ÙŠØ©',
  games: 'Ø£Ù„Ø¹Ø§Ø¨',
  tools: 'Ø£Ø¯ÙˆØ§Øª',
  utility: 'Ù…Ø±Ø§ÙÙ‚',
  menu: 'Ù‚ÙˆØ§Ø¦Ù…',
  stickers: 'Ù…Ù„ØµÙ‚Ø§Øª',
  quotes: 'Ø§Ù‚ØªØ¨Ø§Ø³Ø§Øª',
  music: 'Ù…ÙˆØ³ÙŠÙ‚Ù‰',
  info: 'Ù…Ø¹Ù„ÙˆÙ…Ø§Øª',
};

const commandMap = {
  menu: 'Ø§Ù„Ù‚Ø§Ø¦Ù…Ø©',
  help: 'Ù…Ø³Ø§Ø¹Ø¯Ø©',
  list: 'Ø§Ù„Ù‚Ø§Ø¦Ù…Ø©',
  ping: 'Ø§Ø®ØªØ¨Ø§Ø± Ø§Ù„Ø³Ø±Ø¹Ø©',
  ban: 'Ø­Ø¸Ø±',
  unban: 'Ø¥Ù„ØºØ§Ø¡ Ø§Ù„Ø­Ø¸Ø±',
  kick: 'Ø·Ø±Ø¯',
  mute: 'ÙƒØªÙ…',
  unmute: 'Ø¥Ù„ØºØ§Ø¡ Ø§Ù„ÙƒØªÙ…',
  warn: 'ØªØ­Ø°ÙŠØ±',
  warnings: 'Ø§Ù„ØªØ­Ø°ÙŠØ±Ø§Øª',
  play: 'ØªØ´ØºÙŠÙ„ Ø£ØºÙ†ÙŠØ©',
  song: 'ØªØ­Ù…ÙŠÙ„ Ø£ØºÙ†ÙŠØ©',
  video: 'ØªØ­Ù…ÙŠÙ„ ÙÙŠØ¯ÙŠÙˆ',
  sticker: 'Ù…Ù„ØµÙ‚',
  stickers: 'Ø¨Ø­Ø« Ù…Ù„ØµÙ‚Ø§Øª',
  weather: 'Ø§Ù„Ø·Ù‚Ø³',
  news: 'Ø§Ù„Ø£Ø®Ø¨Ø§Ø±',
  translate: 'ØªØ±Ø¬Ù…Ø©',
  quran: 'Ø¢ÙŠØ© Ù‚Ø±Ø¢Ù†ÙŠØ©',
};

const translit = {
  a: 'Ø§', b: 'Ø¨', c: 'Ùƒ', d: 'Ø¯', e: 'ÙŠ', f: 'Ù', g: 'Ø¬', h: 'Ù‡', i: 'ÙŠ', j: 'Ø¬',
  k: 'Ùƒ', l: 'Ù„', m: 'Ù…', n: 'Ù†', o: 'Ùˆ', p: 'Ø¨', q: 'Ù‚', r: 'Ø±', s: 'Ø³', t: 'Øª',
  u: 'Ùˆ', v: 'Ù', w: 'Ùˆ', x: 'ÙƒØ³', y: 'ÙŠ', z: 'Ø²',
};

function transliterateCommand(cmd) {
  return cmd
    .split('')
    .map((ch) => translit[ch.toLowerCase()] ?? ch)
    .join('');
}

function translateCategory(cat) {
  return categoryMap[cat?.toLowerCase()] || cat;
}

function displayCommand(cmd) {
  const mapped = commandMap[cmd?.toLowerCase()];
  if (mapped) return mapped;
  return transliterateCommand(cmd);
}

function renderMenu(info, categories, prefix) {
  let t = `Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ø£ÙˆØ§Ù…Ø±\n`;
  t += `Ø§Ù„Ø¨ÙˆØª: ${info.bot}\n`;
  t += `Ø§Ù„Ø¨Ø§Ø¯Ø¦Ø©: ${info.prefix}\n`;
  t += `Ø§Ù„Ø¥Ø¶Ø§ÙØ§Øª: ${info.total}\n`;
  t += `Ø§Ù„Ø¥ØµØ¯Ø§Ø±: ${info.version}\n`;
  t += `Ø§Ù„ÙˆÙ‚Øª: ${info.time}\n`;
  for (const [cat, cmds] of categories) {
    t += `\n[${translateCategory(cat)}]\n`;
    for (const c of cmds) {
      t += `â€¢ ${displayCommand(c)} (${prefix}${c})\n`;
    }
  }
  return t.trim();
}

const menuStyles = [
  {
    render({ info, categories, prefix }) {
      return renderMenu(info, categories, prefix);
    },
  },
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export default {
  command: 'Ø§Ù„Ù‚Ø§Ø¦Ù…Ø©',
  aliases: ['help', 'commands', 'h', 'list', 'menu'],
  category: 'Ø¹Ø§Ù…',
  description: 'Ø¹Ø±Ø¶ ÙƒÙ„ Ø§Ù„Ø£ÙˆØ§Ù…Ø±',
  usage: '.Ù…Ù†ÙŠÙˆ [Ø§Ø³Ù… Ø§Ù„Ø£Ù…Ø±]',
  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    const prefix = config.prefixes[0];
    const imagePath = path.join(process.cwd(), 'assets/thumb.png');

    if (args.length) {
      const searchTerm = args[0].toLowerCase();
      let cmd = commandHandler.commands.get(searchTerm);
      if (!cmd && commandHandler.aliases.has(searchTerm)) {
        const mainCommand = commandHandler.aliases.get(searchTerm);
        cmd = commandHandler.commands.get(mainCommand);
      }
      if (!cmd) {
        return sock.sendMessage(
          chatId,
          {
            text: `âŒ Ù„Ù… ÙŠØªÙ… Ø§Ù„Ø¹Ø«ÙˆØ± Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù…Ø± "${args[0]}".\n\nØ§Ø³ØªØ®Ø¯Ù… ${prefix}menu Ù„Ø¹Ø±Ø¶ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø£ÙˆØ§Ù…Ø±.`,
            ...channelInfo,
          },
          { quoted: message },
        );
      }
      const text = `Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„Ø£Ù…Ø±:\n\n` +
        `Ø§Ù„Ø£Ù…Ø±: ${prefix}${cmd.command}\n` +
        `Ø§Ù„ÙˆØµÙ: ${cmd.description || 'Ù„Ø§ ÙŠÙˆØ¬Ø¯ ÙˆØµÙ'}\n` +
        `Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù…: ${cmd.usage || `${prefix}${cmd.command}`}\n` +
        `Ø§Ù„ØªØµÙ†ÙŠÙ: ${translateCategory(cmd.category || 'misc')}\n` +
        `Ø£Ø³Ù…Ø§Ø¡ Ø¨Ø¯ÙŠÙ„Ø©: ${cmd.aliases?.length ? cmd.aliases.map((a) => prefix + a).join(', ') : 'Ù„Ø§ ÙŠÙˆØ¬Ø¯'}`;

      if (fs.existsSync(imagePath)) {
        return sock.sendMessage(
          chatId,
          { image: { url: imagePath }, caption: text, ...channelInfo },
          { quoted: message },
        );
      }
      return sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });
    }

    const style = pick(menuStyles);
    const text = style.render({
      info: {
        bot: config.botName,
        prefix: config.prefixes.join(', '),
        total: commandHandler.commands.size,
        version: config.version || '6.0.0',
        time: formatTime(),
      },
      categories: commandHandler.categories,
      prefix,
    });

    if (fs.existsSync(imagePath)) {
      await sock.sendMessage(
        chatId,
        { image: { url: imagePath }, caption: text, ...channelInfo },
        { quoted: message },
      );
    } else {
      await sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });
    }
  },
};


