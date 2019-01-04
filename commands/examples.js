const DiscordUtil = require('../common/discordutil.js');
const Krdicapi = require('../api/krdicapi.js');
const { prefix } = require('../config.json');

module.exports = {
  name: 'examples',
  description: 'Example Sentences',
  longdescription: 'Get example sentences etc',
  aliases: ['e', 'ex'],
  usage: `${prefix}examples 나무`,
  args: true,
  cooldown: 5,
  execute(message, args) {
    const q = args.join(' ');
    const api = new Krdicapi();
    const isDM = message.channel.type !== 'text';
    const promise = api.searchExamples(q, message);

    function send(dicEntries, answerMessage) {
      const exEmbed = DiscordUtil.createExampleResultEmbed('en', q, message.author.username, isDM, dicEntries);

      if (dicEntries.length === 0) {
        answerMessage.edit(exEmbed);
        return;
      }

      const reactionFilter = (reaction, user) => ['📖'].includes(reaction.emoji.name) && user.id === message.author.id;
      let sent = false;
      answerMessage.edit(exEmbed)
        .then((msg) => {
          if (!isDM) msg.react('📖');
          const collector = msg.createReactionCollector(reactionFilter, { time: 60000 });
          collector.on('collect', (r) => {
            if (r.emoji.name === '📖') {
              if (!isDM) {
                if (!sent) {
                  DiscordUtil.setEmbedFooter(exEmbed, 'Use the reaction to remove this message.');
                  message.author.send(exEmbed)
                    .then(dm => dm.react('❌'));
                  sent = true;
                }
              }
            }
          });
        });
    }

    const pendingEmbed = DiscordUtil.createPendingEmbed(message.author.username);
    message.channel.send(pendingEmbed).then((answerMessage) => {
      promise.then((result) => {
        send(api.parseExampleResult(result), answerMessage);
      }, (err) => {
        throw new Error(err);
      });
    });
  },
};
