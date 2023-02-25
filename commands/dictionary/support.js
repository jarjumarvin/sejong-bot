const DiscordUtil = require('../../common/discordutil');
const { Command } = require('discord.js-commando');

const { support_discord } = require('../../apiconfig.json');


module.exports = class DictionaryCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'support',
      cooldown: 3,
      group: 'dictionary',
      memberName: 'support',
      description: 'Get an invite to Sejongs support discord.',
    })
  }

  run(message) {
    console.log(`${new Date().toLocaleString()} - ${message.author.username} - support`);

    return message.channel
    .send(`Use ${support_discord} for any questions and inquiries regarding Sejong. Feel free to mention @Marvin#1997.`);
  }
};
