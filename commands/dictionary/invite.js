const DiscordUtil = require('../../common/discordutil');
const { Command } = require('discord.js-commando');


module.exports = class DictionaryCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'invite',
      cooldown: 3,
      group: 'dictionary',
      memberName: 'invite',
      description: 'Get an invite link for the bot',
    })
  }

  run(message) {
    console.log(`${message.author.username} - invite`);

    return message.channel
    .send(`Use <https://discordapp.com/oauth2/authorize?client_id=${message.client.user.id}&scope=bot&permissions=60480> to invite me to your server.`);
  }
};
