const fs = require('fs');
const Discord = require('discord.js');
const { prefix, enabled_commands, status } = require('./config.json');
const { discord_token } = require('./apiconfig.json');

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
    if(enabled_commands[command.name]) {
        client.commands.set(command.name, command);
    };
};

const cooldowns = new Discord.Collection();

client.once('ready', () => {
    client.user.setActivity(status[1], { type: status[0] });
    console.log(`(-----------------------SEJONG-----------------------)`);
	console.log(`Username: ${client.user.username}`);
    console.log(`Status: (${status[0].toLowerCase()} ${status[1]})`);
    console.log(`(----------------------COMMANDS----------------------)`);
    for(const com of client.commands) {
        const cmd = client.commands.get(com[0])
            || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(com[0]));

        console.log(`${com[0]}` + (cmd.aliases ? ' (' + cmd.aliases.join(', ') + ')' : ''));
    };
    console.log(`(--------------------LOADING COMPLETE----------------)`);
});

client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
	if (!command) return;
	if (command.guildOnly && message.channel.type !== 'text') {
		return message.reply('I can\'t execute that command inside DMs!');
	}

	if (command.args && !args.length) {
		let reply = `You didn't provide any arguments, ${message.author}!`;
		if (command.usage) {
			reply += `\nThe proper usage would be: \`${command.usage}\``;
		}
		return message.channel.send(reply);
	}

	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;

	if (timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
		}
	}

	timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

	try {
        console.log(`${message.guild.name} - ${message.author.username}: ${command.name}${(args.length && args.join(' ').length < 20) ? ' - ' + args.join(' ') : ''}`);
		command.execute(message, args);
	}
	catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
	}
});
client.login(discord_token);
