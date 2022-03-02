const { prefix } = require('../../config.json');
const Hanja = require('../../hanja/sql');
const DiscordUtil = require('../../common/discordutil.js');
const { Command } = require('discord.js-commando');
const Paginator = require('../../common/paginator');

module.exports = class DictionaryCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'hanja',
      group: 'dictionary',
      memberName: 'hanja',
      description: 'Search for Hanja in English, Korean, or Hanja itself.',
      details: 'Searches the hanja database for meanings of hanjas and related words that occur in the provided argument.\r\n Use the reactions below the message to browse pages or bookmark the result to DMs.',
      aliases: ['h'],
      args: [ {
        key:'word',
        prompt:'What is the word?',
        type: 'string'
      }],
      examples:[`${prefix}hanja 韓國`],
      cooldown: 5
    })
  }

  run(message, word) {
    const args = [word.word];
    const isDM = message.channel.type !== 'text';
    const hanja = new Hanja();

    console.log(`${message.author.username} - hanja - ${args}`);

    const pendingEmbed = DiscordUtil.createPendingEmbed(message.author.username);
    message.channel.send(pendingEmbed).then((pendingMessage) => {
      hanja.searchWords(args).then((results) => {
        const pages = DiscordUtil.createHanjaEmbeds(
          results.query,
          message.author.username,
          isDM,
          results,
        );
        const paginator = new Paginator(message.author, pages, '◀', '▶', true, !results.empty, 'You can no longer browse pages. Anyone can still bookmark this message.');
        paginator.start(pendingMessage);
      });
    });
  }
};