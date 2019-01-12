const DiscordUtil = require('../common/discordutil');

module.exports = {
  name: 'help',
  cooldown: 3,
  execute(message, args) {
    const { commands } = message.client;

    if (!args.length) {
      const helpEmbed = DiscordUtil.createHelpEmbed(commands);
      message.channel.send(helpEmbed);
      return;
    }
    const name = args[0].toLowerCase();
    const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

    if (!command) {
      message.reply(`**${name}** does not seem to be a valid command!`);
      return;
    }

    if (command.name === 'help') {
      const helpEmbed = DiscordUtil.createHelpEmbed(commands);
      message.channel.send(helpEmbed);
      return;
    }

    const detailHelpEmbed = DiscordUtil.createDetailHelpEmbed(command);
    message.channel.send(detailHelpEmbed);
  },
};
