const KrDicApi = require('../api/krdicapi.js');
const DiscordUtil = require('../common/discordutil.js');
const { prefix } = require('../config.json');
const Paginator = require('../common/paginator');

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
      const enEmbed = DiscordUtil.createWordSearchEmbed('en', q, message.author.username, isDM, result);
      const krEmbed = DiscordUtil.createWordSearchEmbed('ko', q, message.author.username, isDM, result);

      if (result.length === 0) {
        answerMessage.edit(enEmbed);
        return;
      }

      const pages = [enEmbed, krEmbed];
      const paginator = new Paginator(message.author, pages, '🇬🇧', '🇰🇷', false, true, 'You can no longer switch languages. Anyone can still bookmark this message.');
      paginator.start(answerMessage);
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
