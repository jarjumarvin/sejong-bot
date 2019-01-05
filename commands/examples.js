const DiscordUtil = require('../common/discordutil.js');
const Krdicapi = require('../api/krdicapi.js');
const { prefix } = require('../config.json');

module.exports = {
  name: 'examples',
  description: 'Search the dictionary for example sentences.',
  longdescription: 'Searches the dictionary for example sentences including the Korean word provided.\r\n\r\nResults come from the National Institute of Korean Language\'s Korean-English Learners\' Dictionary.\r\n\r\nUse the book reaction to bookmark the message to DMs.',
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
