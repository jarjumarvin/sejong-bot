const DiscordUtil = require('../../common/discordutil');
const { Command } = require('discord.js-commando');


module.exports = class OwnerCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'stats',
      cooldown: 3,
      group: 'owner',
      memberName: 'stats',
      description: 'Display some stats.',
    })
  }

  run(message) {
    console.log(`${new Date().toLocaleString()} - ${message.author.username} - stats`);

    const embed = DiscordUtil.createBasicEmbed().setDescription(`Currently active on ${this.client.guilds.cache.size} servers.`)
    return message.channel.send(embed);
  }
};