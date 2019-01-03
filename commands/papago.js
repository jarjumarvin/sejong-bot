const Discord = require('discord.js');
const { prefix, accentColor} = require('../config.json');
const papagoapi = require('../api/papagoapi.js');
const langs = require('../api/langs.js');

module.exports = {
	name: 'papago',
	description: `Use Naver Papago to translate a sentence. (default: en-kr) See ${prefix}help papago for other options.`,
	longdescription: `Translate a sentence using Papago. Use ${prefix}papago to translate from Korean to English (default).
		\r\nUse ${prefix}papago [source]>[target] [text] to specify both the target and source language.\r\n
		The available language codes are: ko (Korean), en (English), zh-CN (Chinese), zh-TW (Taiwanese), es (Spanish), fr (French), vi (Vietnamese), th (Thai), id (Indonesian).
		\r\nThe available combinations are:\r\nko<->en\r\nko<->zh-CN\r\nko<->zh-TW\r\nko<->es\r\nko<->fr\r\nko<->vi\r\nko<->th\r\nko<->id\r\nen<->ja\r\nen<->fr`,
	aliases: ['p', 'ppg'],
	args: true,
	usage: `${prefix}papago ko-en 안녕하세요`,
    cooldown: 5,
	execute(message, args) {
		// get language codes or use default
		let source = 'ko';
		let target = 'en';

		let l = args[0].split('>');
		if(l.length == 2) {
			source = l[0];
			target = l[1];
			args.shift();
		};
		if(!langs[source] || !langs[target]) {
			console.log(`tried to translate ${source}>${target}`);
			return message.reply('enter a valid combination of languages. The available combinations are:\r\nko<->en\r\nko<->zh-CN\r\nko<->zh-TW\r\nko<->es\r\nko<->fr\r\nko<->vi\r\nko<->th\r\nko<->id\r\nen<->ja\r\nen<->fr');
		} else if(source == target) {
			console.log(`same language ${source}>${target}`);
			return message.reply('source and target language must be different');
		};

		if(!args.length) {
			console.log(`no text after languages`);
			return message.reply('enter a text to translate.');
		};

		let q = args.join(' ');
		let p = new papagoapi();
		var promise = p.translate(q, source, target);
		function send(result) {
			const embed = new Discord.RichEmbed()
				.setColor(accentColor)
				.setAuthor('Sejong', 'https://i.imgur.com/v95B0db.jpg');
			if(!result) {
				console.log('Error', result);
				embed.addField('Error', 'No results have been found');
			} else {
				embed.addField('Result', result.translatedText);
				embed.addField('Original Language', langs[result.srcLangType], true);
				embed.addField('Target Language', langs[result.tarLangType], true);
			}
			message.channel.send(embed);
		}

		promise.then(function(result) {
			send(JSON.parse(result).message.result);
		}, function(err) {
			send(null);
			console.log(err);
		})
	},
};
