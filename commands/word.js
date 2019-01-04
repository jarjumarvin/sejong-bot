const DiscordUtil = require('../common/discordutil.js');
const KrDicApi = require('../api/krdicapi.js');
const { prefix } = require('../config.json');

module.exports = {
  name: 'word',
  description: 'Lookup a word',
  longdescription: 'Get definitions etc',
  aliases: ['w'],
  usage: `${prefix}word 나무`,
  args: true,
  cooldown: 5,
  execute(message, args, isDM) {
    const q = args.join(' ');
    const api = new KrDicApi();
    const promise = api.searchWord(q, message);

    function send(dicEntries, answerMessage) {
      const enEmbed = DiscordUtil.createSearchResultEmbed('en', q, message.author.username, isDM, dicEntries);
      const krEmbed = DiscordUtil.createSearchResultEmbed('ko', q, message.author.username, isDM, dicEntries);

      if (dicEntries.length === 0) {
        answerMessage.edit(enEmbed);
        return;
      }
      let en = true;
      let sent = false;

      const reactionFilter = (reaction, user) => ['🇰🇷', '🇬🇧', '📖'].includes(reaction.emoji.name) && user.id === message.author.id;
      answerMessage.edit(enEmbed)
        .then(msg => msg.react('🇬🇧'))
        .then(enReact => enReact.message.react('🇰🇷'))
        .then((krReact) => {
          if (!isDM) krReact.message.react('📖');
          const collector = krReact.message
            .createReactionCollector(reactionFilter, { time: 60000 });

          collector.on('collect', (r) => {
            if (r.emoji.name === '🇬🇧') {
              en = true;
              r.message.edit(enEmbed);
            } else if (r.emoji.name === '🇰🇷') {
              en = false;
              r.message.edit(krEmbed);
            } else if (r.emoji.name === '📖' && !isDM && !sent) {
              DiscordUtil.setEmbedFooter(enEmbed, 'Use the reaction to remove this message.');
              DiscordUtil.setEmbedFooter(krEmbed, 'Use the reaction to remove this message.');
              message.author.send(en ? enEmbed : krEmbed)
                .then(dm => dm.react('❌'));
              sent = true;
            }
          });

          collector.on('end', () => {
            if (en) {
              DiscordUtil.setEmbedFooter(enEmbed, `You can no longer use emojis to toggle the language ${isDM ? 'or bookmark the result' : ''}.`);
              answerMessage.edit(enEmbed);
            } else {
              DiscordUtil.setEmbedFooter(krEmbed, `You can no longer use emojis to toggle the language ${isDM ? 'or bookmark the result' : ''}.`);
              answerMessage.edit(krEmbed);
            }
          });
        })
        .catch((error) => {
          throw new Error(error);
        });
    }

    const pendingEmbed = DiscordUtil.createPendingEmbed(message.author.username);
    message.channel.send(pendingEmbed).then((answerMessage) => {
      promise.then((result) => {
        send(api.parseWordResult(result), answerMessage);
      }, (err) => {
        throw new Error(err);
      });
    });
  },
};
