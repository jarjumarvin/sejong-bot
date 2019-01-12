const { prefix } = require('../config.json');
const Hanja = require('../hanja/sql');
const DiscordUtil = require('../common/discordutil.js');
const Paginator = require('../common/paginator');

module.exports = {
  name: 'hanja',
  description: 'Search for Hanja in English, Korean, or Hanja itself.',
  longdescription: 'Searches the hanja database for meanings of hanjas and related words that occur in the provided argument.\r\n Use the reactions below the message to browse pages or bookmark the result to DMs.',
  aliases: ['h'],
  args: true,
  usage: `${prefix}hanja 韓國`,
  cooldown: 5,
  execute(message, args) {
    const isDM = message.channel.type !== 'text';
    const hanja = new Hanja();
    const pendingEmbed = DiscordUtil.createPendingEmbed(message.author.username);
    message.channel.send(pendingEmbed).then((pendingMessage) => {
      hanja.searchWords(args).then((results) => {
        const pages = DiscordUtil.createHanjaEmbeds(
          results.query,
          message.author.username,
          isDM,
          results,
        );
        const paginator = new Paginator(message.author, pages, '◀', '▶', true, !results.empty, 'You can no browse pages. Anyone can still bookmark this message.');
        paginator.start(pendingMessage);
      });
    });
  },
};
