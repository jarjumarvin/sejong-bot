const DiscordUtil = require('../common/discordutil.js');
const PapagoApi = require('../api/papagoapi.js');
const langs = require('../common/langs.js');
const { prefix } = require('../config.json');

module.exports = {
  name: 'papago',
  description: `Translate a text using Papago. (default: ko>en) \r\nSee \\${prefix}help papago for other options.`,
  longdescription: `Translate a sentence using Papago. Use \\${prefix}papago to translate from Korean to English (default).
  \r\nUse \\${prefix}papago [source]>[target] [text] to specify both the target and source language.\r\n
  The available language codes are: ko (Korean), en (English), zh-CN (Chinese), zh-TW (Taiwanese), es (Spanish), fr (French), vi (Vietnamese), th (Thai), id (Indonesian).
  \r\nThe available combinations are:\r\nko<->en\r\nko<->zh-CN\r\nko<->zh-TW\r\nko<->es\r\nko<->fr\r\nko<->vi\r\nko<->th\r\nko<->id\r\nen<->ja\r\nen<->fr`,
  aliases: ['p', 'ppg'],
  args: true,
  usage: `${prefix}papago ko>en 안녕하세요`,
  cooldown: 5,

  execute(message, args) {
    let source = 'ko';
    let target = 'en';

    const l = args[0].split('>');
    if (l.length === 2) {
      [source, target] = l;
      args.shift();
    }

    if (!langs[source] || !langs[target]) {
      message.reply(`enter a valid combination of languages. The available combinations are:
        \r\nko<->en\r\nko<->zh-CN\r\nko<->zh-TW\r\nko<->es\r\nko<->fr\r\nko<->vi\r\nko<->th\r\nko<->id\r\nen<->ja\r\nen<->fr`);
      return;
    }

    if (source === target) {
      message.reply('source and target language must be different');
      return;
    }

    if (!args.length) {
      message.reply('enter a text to translate.');
      return;
    }

    const q = args.join(' ');
    const p = new PapagoApi();
    const promise = p.translate(q, source, target);

    function send(result) {
      message.channel.send(DiscordUtil.createTranslationResultEmbed(result));
    }

    promise.then((result) => {
      send(result);
    }, (err) => {
      throw new Error(err);
    });
  },
};
