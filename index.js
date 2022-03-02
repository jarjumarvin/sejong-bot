const { CommandoClient } = require('discord.js-commando');
const Discord = require('discord.js');
const DiscordUtil = require('./common/discordutil');
const path = require('path');
const got = require('got');

const {
	prefix, status
  } = require('./config.json');

const { discord_token, owner_id } = require('./apiconfig.json');

const client = new CommandoClient({
	commandPrefix: prefix,
  owner: owner_id,
  invite: 'https://discord.gg/EhGjg2drSQ',
  partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
  intents: ['GUILD_PRESENCES', 'GUILD_MEMBERS', 'GUILD_MESSAGES']
});

client.registry
	.registerDefaultTypes()
	.registerGroups([
		['dictionary', 'Command Group for Dictionary functionalities'],
		['owner', 'Command Group for Developer functionalities'],
	])
	.registerDefaultGroups()
	.registerDefaultCommands({
    help: false,
    prefix: false,
    eval: false,
    ping: false,
    commandState: false,
    unknownCommand: false
  })
	.registerCommandsIn(path.join(__dirname, 'commands'));

// DISABLED COMMANDS
ppg = client.registry.groups.get('dictionary').commands.get('papago')
if (ppg) {
  client.registry.unregisterCommand(ppg)
}

client.once('ready', () => {
  client.user.setActivity(status[1], { type: status[0] });
  console.log('(-----------------------SEJONG-----------------------)');
  console.log(`(----Logged in as ${client.user.username} using prefix ${prefix}`);
  console.log('(----------------------------------------------------)');
});

// CATCH RAW REACTION
const rawEventTypes = {
  MESSAGE_REACTION_ADD: 'messageReactionAdd',
};

client.on('raw', async (event) => {
  if (!rawEventTypes[event.t]) return;
  const { d: data } = event;
  const user = client.users.cache.get(data.user_id);
  const channel = client.channels.cache.get(data.channel_id) || await user.createDM();

  try {
    const message = await channel.messages.fetch(data.message_id);
    const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
  
    let reaction = message.reactions.cache;
    if (!reaction) {
      const emoji = new Discord.Emoji(client.guilds.get(data.guild_id), data.emoji);
      reaction = new Discord.MessageReaction(message, emoji, 1, data.user_id === client.user.id);
    }
  } catch (error) {
    // ignore lol
  }
});

client.on('messageReactionAdd', async (reaction, user) => {
  // When we receive a reaction we check if the reaction is partial or not
	if (reaction.partial) {
		// If the message this reaction belongs to was removed the fetching might result in an API error, which we need to handle
		try {
			await reaction.fetch();
		} catch (error) {
			// console.error('Something went wrong when fetching the message: ', error);

      // we ignore this

			// Return as `reaction.message.author` may be undefined/null
			return;
		}
	}

  if (reaction.message.author.id === client.user.id && reaction.emoji.name === '❌' && reaction.message.channel.type !== 'text') {
    if (user.id !== client.user.id) {
      reaction.message.delete();
    }
  }
  if (reaction.emoji.name === '🔖' && reaction.message.channel.type === 'text') {
    if (user.id !== client.user.id) {
      var datetime = new Date().toLocaleString();
      if (reaction.message.embeds[0] && reaction.message.author.id === client.user.id) {
        const embed = reaction.message.embeds[0];
        user.send({ embed }).then(msg => msg.react('❌'));
        console.log(`${user.username} - result bookmark `);
      } else {
        console.log(`${user.username} - message bookmark `);
        DiscordUtil.bookmark(reaction.message, user);
      }
    }
  }
});



client.on('error', console.error);

client.login(discord_token);