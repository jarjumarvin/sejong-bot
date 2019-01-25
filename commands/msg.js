
module.exports = {
  name: 'msg',
  devOnly: true,
  args: true,
  execute(message, args) {
    const channel = args[0];
    const content = args[1];
    if (!content || !channel) {
      message.channel.send(`You didn't provide the right arguments, ${message.author}!`);
    } else {
      message.client.channels.get(channel).send(content);
    }
  },
};
