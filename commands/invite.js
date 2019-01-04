module.exports = {
  name: 'invite',
  description: 'Get an invite link.',
  cooldown: 60,
  longdescription: '',
  execute(message) {
    return message.channel
      .send(`Use https://discordapp.com/oauth2/authorize?client_id=${message.client.user.id}&scope=bot&permissions=52288 to invite me to your server.`);
  },
};
