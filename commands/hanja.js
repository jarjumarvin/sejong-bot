const { prefix } = require('../config.json');
const Hanja = require('../hanja/sql');
const DiscordUtil = require('../common/discordutil.js');
const Paginator = require('../common/paginator');

module.exports = {
  name: 'hanja',
  description: 'Search for Hanja.',
  aliases: ['hj'],
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
        console.log(results.empty);
        const paginator = new Paginator(message.author, pages, '◀', '▶', true, !results.empty);
        paginator.start(pendingMessage);
      });
    });
  },
};
