const { prefix } = require('../config.json');

module.exports = {
	name: 'avatar',
	description: 'Retrieve avatar URL',
	longdescription: 'Get the avatar URL of the tagged user(s), or your own avatar if no user is tagged.',
	aliases: ['icon', 'pfp'],
	usage: `${prefix}avatar [@User]`,
	execute(message) {
		if (!message.mentions.users.size) {
			return message.channel.send(`Your avatar: <${message.author.displayAvatarURL}>`);
		}

		const avatarList = message.mentions.users.map(user => {
			return `${user.username}'s avatar: <${user.displayAvatarURL}>`;
		});

		message.channel.send(avatarList);
	},
};
