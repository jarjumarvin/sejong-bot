var krdicapi = require('../api/krdicapi.js');
const Discord = require('discord.js');
const { prefix, accentColor } = require('../config.json');

module.exports = {
	name: 'word',
	description: 'Lookup a word',
	longdescription: 'Get definitions etc',
	aliases: ['w'],
	usage: `${prefix}word 나무`,
    args: true,
    cooldown: 5,
	execute(message, args) {
        const q = args.join(' ');
        let p = new krdicapi();
        const promise = p.searchWord(q, message);
        function send(dic_entries, message) {
            const enEmbed = new Discord.RichEmbed()
                .setColor(accentColor)
                .setAuthor('Sejong', 'https://i.imgur.com/v95B0db.jpg');
            if(dic_entries.length == 0) {
                enEmbed.addField('Error', 'No results have been found');
            } else {
                enEmbed.setFooter(`${message.author.username} can use emojis within 60s to change language`, 'https://i.imgur.com/v95B0db.jpg');
                var big = 0;
                for(const entry of dic_entries) {
                    if(enEmbed.fields.length < 6) {
                        if(big < 2) {
                            let word = entry.word;
                            let type = entry.pos_trans;
                            let defs = [];
                            var j
                            for(j = 0; j < entry.entry_definitions.length; j++) {
                                if(j < 8) {
                                    defs.push(`${j + 1}. ` + entry.entry_definitions[j]['definition_trans'].trim());
                                } else {
                                    big++;
                                    break;
                                }
                            }
                            enEmbed.addField(entry.word + ` (${type})`, '' + defs.join('\n'));
                        }
                    }
                }
            };

            const krEmbed = new Discord.RichEmbed()
                .setColor(accentColor)
                .setAuthor('Sejong', 'https://i.imgur.com/v95B0db.jpg');

            if(dic_entries.length == 0) {
                krEmbed.addField('Error', 'No results have been found')
            } else {
                krEmbed.setFooter(`${message.author.username} can use emojis within 60s to change language`, 'https://i.imgur.com/v95B0db.jpg');
                var big = 0;
                for(const entry of dic_entries) {
                    if(krEmbed.fields.length < 6) {
                        if(big < 2) {
                            let word = entry.word;
                            let type = entry.pos;
                            let defs = [];
                            var j
                            for(j = 0; j < entry.entry_definitions.length; j++) {
                                if(j < 8) {
                                    defs.push(`${j + 1}. ` + entry.entry_definitions[j]['definition_korean'].trim());
                                } else {
                                    big++;
                                    break;
                                }
                            }
                            krEmbed.addField(entry.word + ` (${type})`, '' + defs.join('\n'));
                        }
                    }
                }
            };
            if(dic_entries.length == 0) {
                message.channel.send(enEmbed);
            } else {
                const reactionFilter = (reaction, user) => ['🇰🇷', '🇬🇧'].includes(reaction.emoji.name) && user.id === message.author.id;
                message.channel.send(enEmbed)
                    .then(msg => msg.react('🇬🇧'))
                    .then(reaction => reaction.message.react('🇰🇷'))
                    .then(reaction => {
                        const collector = reaction.message.createReactionCollector(reactionFilter, { time: 60000 });
                        collector.on('collect', r => {
                            if(r.emoji.name === '🇬🇧') {
                                r.message.edit(enEmbed);
                            } else {
                                r.message.edit(krEmbed);
                            }
                        });
                    })
                    .catch(error => {
						throw new Error(error);
					});
            }
        }
        promise.then(function(result) {
            send(p.parseWordResult(result), message);
        }, function(err) {
            throw new Error(err);
        });
	},
};
