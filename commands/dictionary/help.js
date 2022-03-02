const DiscordUtil = require('../../common/discordutil');
const { Command } = require('discord.js-commando');


module.exports = class DictionaryCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'help',
      cooldown: 3,
      group: 'dictionary',
      aliases: [],
      memberName: 'help',
      description: 'shows options and examples for all dictionary commands'
    })
  }

  run(message, args) {
    const commands = message.client.registry.groups.get('dictionary').commands;
  
    console.log(`${message.author.username} - help`);

    if (!args) {
      const helpEmbed = DiscordUtil.createHelpEmbed(commands);
      message.channel.send(helpEmbed);
      return;
    } else {
      args = args.split(" ");
      if (args.length != 1) {
        message.reply(`Please only supply a single command!`);
        return;
      } 
    }

    const name = args[0].toLowerCase();
    if (name === 'all') {
      const helpEmbed = DiscordUtil.createHelpEmbed(commands);
      message.channel.send(helpEmbed);
      return;
    } else {
      const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

      if (!command || command.devOnly) {
        message.reply(`**${name}** does not seem to be a valid command!`);
        return;
      }

      const detailHelpEmbed = DiscordUtil.createDetailHelpEmbed(command);
      message.channel.send(detailHelpEmbed);
    }
  }
};