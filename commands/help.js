const Discord = require('discord.js');
const { prefix, enabled_commands, accentColor } = require('../config.json');

module.exports = {
    name: 'help',
	description: 'Display Commands',
    longdescription: 'Display help window  ',
	aliases: ['h', 'c'],
    usage: `${prefix}help <command>`,
	cooldown: 3,
	execute(message, args) {
        const { commands } = message.client;
        if(!args.length) {
            const bigEmbed = new Discord.RichEmbed()
                .setColor(accentColor)
                .setAuthor('Sejong', 'https://i.imgur.com/v95B0db.jpg')
                .setDescription(`Use **${prefix}help <command>** to see information about a specific command.`);

            for(const c of commands) {
                if(enabled_commands[c[1].name]) {
                    const name = c[1].name;
                    const aliases = c[1].aliases;
                    const description = c[1].description + (c[1].usage ? `\r\n __(Ex. ${c[1].usage})__` : '');

                    const title = `${prefix}${name} ${aliases ? '(short: ' + aliases.map(e => prefix + e).join(', ') + ')' : ''}`;
                    bigEmbed.addField(title, description);
                }
            }
            message.channel.send(bigEmbed);
            return;
        }
        const name = args[0].toLowerCase();
        const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

        if (!command) {
            return message.reply(`**${name}** does not seem to be a valid command!`);
        }

        if (!enabled_commands[command.name]) {
            return message.reply(`**${name}** does not seem to be a valid command!`);
        }

        const detailEmbed = new Discord.RichEmbed()
            .setColor(accentColor)
            .setAuthor('Sejong', 'https://i.imgur.com/v95B0db.jpg')
            .setDescription(`**${prefix}${command.name} ${command.aliases ? '(short: ' + command.aliases.map(e => prefix + e).join(', ') + ')' : ''}` + '**\n' +
                command.longdescription ? command.longdescription : command.description);

        if(command.usage) {
            detailEmbed.addField('Usage Example', command.usage ? command.usage : 'None');
        }
        detailEmbed.addField('Cooldown', command.cooldown ? command.cooldown + ' seconds': 'None', true);
        detailEmbed.addField('Required Permissions', command.permissions ? command.permissions : 'None', true);

        message.channel.send(detailEmbed)
	},
};
