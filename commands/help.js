const Discord = require('discord.js');
const {
  prefix,
  enabledCommands,
  accentColor,
} = require('../config.json');

module.exports = {
  name: 'help',
  description: 'Display Commands',
  longdescription: 'Display help window  ',
  aliases: ['h', 'c'],
  usage: `${prefix}help <command>`,
  cooldown: 3,
  execute(message, args) {
    const { commands } = message.client;
    // commands = commands.sort((e, w) => commandOrder[e.name] - commandOrder[w.name]);

    if (!args.length) {
      const bigEmbed = new Discord.RichEmbed()
        .setColor(accentColor)
        .setAuthor('Sejong', 'https://i.imgur.com/v95B0db.jpg')
        .setDescription(`Use **${prefix}help <command>** to see information about a specific command.`);

      commands.forEach((c) => {
        const {
          name,
          aliases,
          description,
          usage,
        } = c;

        const descriptionAndUsage = description + (usage ? `\r\n __(Ex. ${usage})__` : '');
        const title = `${prefix}${name} ${aliases ? `(short: ${aliases.map(e => prefix + e).join(', ')})` : ''}`;
        bigEmbed.addField(title, descriptionAndUsage);
      });

      message.channel.send(bigEmbed);
      return;
    }

    const name = args[0].toLowerCase();
    const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

    if (!command) {
      message.reply(`**${name}** does not seem to be a valid command!`);
      return;
    }

    if (!enabledCommands[command.name]) {
      message.reply(`**${name}** does not seem to be a valid command!`);
      return;
    }

    const detailEmbed = new Discord.RichEmbed()
      .setColor(accentColor)
      .setAuthor('Sejong', 'https://i.imgur.com/v95B0db.jpg')
      .setDescription(`**${prefix}${command.name} ${command.aliases ? `(short: ${command.aliases.map(e => prefix + e).join(', ')})` : ''}**\n
        ${command.longdescription ? command.longdescription : command.description}`);

    if (command.usage) {
      detailEmbed.addField('Usage Example', command.usage ? command.usage : 'None');
    }
    detailEmbed.addField('Cooldown', command.cooldown ? `${command.cooldown} seconds` : 'None', true);
    detailEmbed.addField('Required Permissions', command.permissions ? command.permissions : 'None', true);
    message.channel.send(detailEmbed);
  },
};
