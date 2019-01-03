var krdicapi = require('../api/krdicapi.js');
const Discord = require('discord.js');
const { prefix, accentColor } = require('../config.json');

module.exports = {
	name: 'examples',
	description: 'Example Sentences',
	longdescription: 'Get example sentences etc',
	aliases: ['e', 'ex'],
	usage: `${prefix}examples 나무`,
    args: true,
    cooldown: 5,
	execute(message, args) {
        const q = args.join(' ');
        let p = new krdicapi();
		var isDM = message.channel.type !== 'text';
        const promise = p.searchExamples(q, message);

		function send(dic_entries, message, pendingMessage) {
			const exEmbed = new Discord.RichEmbed()
				.setColor(accentColor)
				.setAuthor('Sejong', 'https://i.imgur.com/v95B0db.jpg')

			if(dic_entries.length == 0) {
                exEmbed.addField('Error', 'No results have been found')
				pendingMessage.edit(exEmbed);
            } else {
				var i;
				var s = `Example sentences for **${q}**:\r\n\r\n`;
				for(i = 0; i < dic_entries.length; i++) {
					s += `**${i + 1}.** ` + dic_entries[i].example + `\r\n\r\n`;
				}
				exEmbed.setDescription(s);
				if(!isDM) {
					exEmbed.setFooter(`${message.author.username}, you can bookmark the result using a reaction.`, 'https://i.imgur.com/v95B0db.jpg');
				}

				const reactionFilter = (reaction, user) => ['🔖'].includes(reaction.emoji.name) && user.id === message.author.id;
				var sent = false;
				pendingMessage.edit(exEmbed)
					.then(msg => {
						if(!isDM) msg.react('🔖');
						const collector = msg.createReactionCollector(reactionFilter, { time: 60000 });
                        collector.on('collect', r => {
                            if(r.emoji.name === '🔖') {
								if(!isDM) {
									if(!sent) {
										exEmbed.setFooter('Use the reaction to remove this message.', 'https://i.imgur.com/v95B0db.jpg');
										message.author.send(exEmbed)
											.then(dm => dm.react('❌'));
										sent = true;
									};
								};
                            }
                        });
					});
			}
        }

		const pendingEmbed = new Discord.RichEmbed()
			.setColor(accentColor)
			.setAuthor('Sejong', 'https://i.imgur.com/v95B0db.jpg')
			.setDescription(`I am going over the books for you ${message.author.username}, please wait. :eyes:`);

		message.channel.send(pendingEmbed).then(pendingMessage => {
			promise.then(function(result) {
				send(p.parseExampleResult(result), message, pendingMessage);
			}, function(err) {
				throw new Error(err);
			});
		});

	},
};
