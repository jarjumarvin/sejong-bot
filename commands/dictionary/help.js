const DiscordUtil = require('../../common/discordutil');
const { Command } = require('discord.js-commando');


module.exports = class DictionaryCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'dictionary-help',
      cooldown: 3,
      group: 'dictionary',
      aliases: ['dict-h', 'dict-help'],
      memberName: 'dictionary-help',
      description: 'shows options and examples for all dictionary commands',
      args: [
        {
          key:'command',
          prompt:'What is the command?',
          type: 'string'
        }
      ]
    })
  }

  run(message, args) {
    args = [args.command];
    const commands = message.client.registry.groups.get('dictionary').commands;

    if (!args.length) {
      const helpEmbed = DiscordUtil.createHelpEmbed(commands);
      message.channel.send(helpEmbed);
      return;
    }

    const name = args[0].toLowerCase();
    if (name === 'all') {
      const helpEmbed = DiscordUtil.createHelpEmbed(commands);
      message.channel.send(helpEmbed);
      return;
    }
    const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

    if (!command || command.devOnly) {
      message.reply(`**${name}** does not seem to be a valid command!`);
      return;
    }


    const detailHelpEmbed = DiscordUtil.createDetailHelpEmbed(command);
    message.channel.send(detailHelpEmbed);
  }
};