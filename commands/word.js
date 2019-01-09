const KrDicApi = require('krdict-api');
const DiscordUtil = require('../common/discordutil.js');
const { prefix } = require('../config.json');

module.exports = {
  name: 'word',
  description: 'Search the dictionary for a Korean word.',
  longdescription: 'Searches the dictionary for the Korean word provided and lists found results along with respective meanings. Results come from the National Institute of Korean Language\'s Korean-English Learners\' Dictionary.\r\n\r\nEnglish definitions are displayed by default.\r\n\r\nUse the Korean / English flag reactions to swap the language of the meanings, or use the book reaction to bookmark the message to DMs.',
  aliases: ['w'],
  args: true,
  usage: `${prefix}word 나무`,
  cooldown: 5,
  execute(message, args) {
    const isDM = message.channel.type !== 'text';
    const q = args.join(' ');
    const api = new KrDicApi();
    const promise = api.searchWords(q, 5, 7);

    function send(result, answerMessage) {
      const enEmbed = DiscordUtil.createDevSearchEmbed('en', q, message.author.username, isDM, result);
      const krEmbed = DiscordUtil.createDevSearchEmbed('ko', q, message.author.username, isDM, result);

      if (result.length === 0) {
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
            .createReactionCollector(reactionFilter, { time: 120000 });

          collector.on('collect', (r) => {
            if (r.emoji.name === '🇬🇧') {
              en = true;
              r.message.edit(enEmbed);
            } else if (r.emoji.name === '🇰🇷') {
              en = false;
              r.message.edit(krEmbed);
            } else if (r.emoji.name === '📖' && !isDM && !sent) {
              sent = true;
            }
          });

          collector.on('end', () => {
            if (en) {
              DiscordUtil.setEmbedFooter(enEmbed, 'You can no longer use emojis to toggle the language. Anyone can still bookmark.');
              answerMessage.edit(enEmbed);
            } else {
              DiscordUtil.setEmbedFooter(enEmbed, 'You can no longer use emojis to toggle the language. Anyone can still bookmark.');
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
        send(result, answerMessage);
      }, (err) => {
        throw new Error(err);
      });
    });
  },
};
