const Discord = require('discord.js');

const { prefix, enabledCommands, status } = require('./config.json');
const { discordToken } = require('./apiconfig.json');

const client = new Discord.Client();
client.commands = new Discord.Collection();

enabledCommands.forEach((name) => {
  const command = require(`./commands/${name}.js`);
  client.commands.set(command.name, command);
});

const cooldowns = new Discord.Collection();

client.once('ready', () => {
  client.user.setActivity(status[1], { type: status[0] });
  console.log('(-----------------------SEJONG-----------------------)');
  console.log(`Username: ${client.user.username}`);
  console.log(`Status: (${status[0].toLowerCase()} ${status[1]})`);
  console.log('(----------------------COMMANDS----------------------)');
  console.log(client.commands.map(e => e.name));
  console.log('(--------------------LOADING COMPLETE----------------)');
});

client.on('messageReactionAdd', (reaction, user) => {
  if (reaction.message.author.id === client.user.id && reaction.emoji.name === '❌' && reaction.message.channel.type !== 'text') {
    if (reaction.message.reactions.find(rawReaction => rawReaction.me)
    && user.id !== client.user.id) {
      reaction.message.delete();
    }
  }
  if (reaction.message.author.id === client.user.id && reaction.emoji.name === '📖' && reaction.message.channel.type === 'text') {
    if (reaction.message.reactions.find(rawReaction => rawReaction.me)
    && user.id !== client.user.id) {
      const embed = reaction.message.embeds[0];
      user.send({ embed }).then(dm => dm.react('❌'));
    }
  }
});

const events = {
  MESSAGE_REACTION_ADD: 'messageReactionAdd',
};

client.on('raw', async (event) => {
  if (!events[event.t]) return;
  const { d: data } = event;
  const user = client.users.get(data.user_id);
  const channel = client.channels.get(data.channel_id) || await user.createDM();

  if (channel.messages.has(data.message_id)) return;

  const message = await channel.fetchMessage(data.message_id);
  const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;

  let reaction = message.reactions.get(emojiKey);
  if (!reaction) {
    const emoji = new Discord.Emoji(client.guilds.get(data.guild_id), data.emoji);
    reaction = new Discord.MessageReaction(message, emoji, 1, data.user_id === client.user.id);
  }
  client.emit(events[event.t], reaction, user);
});

client.on('message', (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;
  const args = message.content.slice(prefix.length).split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command = client.commands.get(commandName)
    || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) return;
  if (command.guildOnly && message.channel.type !== 'text') {
    message.reply('I can\'t execute that command inside DMs!');
    return;
  }

  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments, ${message.author}!`;
    if (command.usage) {
      reply += `\nThe proper usage would be: \`${command.usage}\``;
    }
    message.channel.send(reply);
    return;
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
      message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
      return;
    }
  }

  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

  try {
    const isDM = message.channel.type !== 'text';
    if (isDM) console.log(`DM - ${message.author.username}: ${command.name}${(args.length && args.join(' ').length < 30) ? ` - ${args.join(' ')}` : ''}`);
    else console.log(`${message.guild.name} - ${message.author.username}: ${command.name}${(args.length && args.join(' ').length < 30) ? ` - ${args.join(' ')}` : ''}`);
    command.execute(message, args, isDM);
  } catch (error) {
    console.error(error);
    message.reply('there was an error trying to execute that command!');
  }
});
client.login(discordToken);
