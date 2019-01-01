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
        const promise = p.searchExamples(q, message);

        function send(dic_entries, message) {
			const krEmbed = new Discord.RichEmbed()
				.setColor(accentColor)
				.setAuthor('Sejong', 'https://i.imgur.com/v95B0db.jpg')

			if(dic_entries.length == 0) {
                krEmbed.addField('Error', 'No results have been found')
            } else {
				var i;
				var s = `Example sentences for **${q}**:\r\n\r\n`;
				for(i = 0; i < dic_entries.length; i++) {
					s += `**${i + 1}.** ` + dic_entries[i].example + `\r\n\r\n`;
				}
				krEmbed.setDescription(s);
			}
			message.channel.send(krEmbed);
        }

        promise.then(function(result) {
            send(p.parseExampleResult(result), message);
        }, function(err) {
            throw new Error(err);
        });
	},
};
