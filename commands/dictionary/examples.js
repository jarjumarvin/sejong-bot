const DiscordUtil = require('../../common/discordutil.js');
const { Command } = require('discord.js-commando');
const ExampleSentenceAPI = require('../../api/exampleapi.js');
const { prefix } = require('../../config.json');

module.exports = class DictionaryCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'examples',
      aliases: ['e', 'ex'],
      group: 'dictionary',
      memberName: 'examples',
      description: 'Search the dictionary for example sentences.',
      details: 'Searches the dictionary for example sentences including the Korean word provided.\r\n\r\nResults come from the National Institute of Korean Language\'s Korean-English Learners\' Dictionary.\r\n\r\nUse the book reaction to bookmark the message to DMs.',
      examples: [`${prefix}examples 나무`],
      cooldown: 5,
      args: [
        {
          key:'word',
          prompt:'What is the word?',
          type: 'string'
        }
      ]
    })
  }

  run(message, word) {
    //const args = word.word;
    const q = word.word;
    const api = new ExampleSentenceAPI();
    const isDM = message.channel.type !== 'text';

    console.log(`${new Date().toLocaleString()} - ${message.author.username} - examples - ${q}`);

    const promise = api.searchExamples(q, message);

    function send(dicEntries, answerMessage) {
      const exEmbed = DiscordUtil.createExampleResultEmbed('en', q, message.author.username, isDM, dicEntries);
      
      
      if (dicEntries.length === 0) {
        answerMessage.edit(exEmbed);
        return;
      }
      answerMessage.edit(exEmbed)
      .then((msg) => {
        if (!isDM) msg.react('🔖');
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
  }
};