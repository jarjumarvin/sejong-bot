const Discord = require('discord.js');
const { prefix, accentColor, avatar } = require('../config.json');
const langs = require('./langs.js');

module.exports = {
  bookmark(message, user) {
    if (!user.dmChannel) {
      user.createDM();
    }

    const attachment = message.attachments.first();
    let image;
    if (attachment && (attachment.width || attachment.height)) {
      image = attachment.url;
    }

    if (!image && !message.content) {
      if (message.embeds[0]) {
        const embed = message.embeds[0];
        user.send(`Sent by: ${message.author.username}`, { embed }).then(msg => msg.react('❌'));
        return;
      }
    }

    const embed = new Discord.RichEmbed()
      .setColor(0xDF2B40)
      .setAuthor(`${message.author.username} said:`, message.author.avatarURL ? message.author.avatarURL : undefined)
      .setDescription(`${message.content}${image ? `\r\n\r\n${image}` : ''}`)
      .setImage(image)
      .setTimestamp(message.editedTimestamp || message.createdTimestamp);

    user.send(embed).then(msg => msg.react('❌'));
  },

  createBasicEmbed(name) {
    return new Discord.RichEmbed()
      .setColor(accentColor)
      .setAuthor(name || 'Sejong', 'https://i.imgur.com/v95B0db.jpg');
  },

  setEmbedFooter(embed, footer) {
    embed.setFooter(footer, avatar);
  },

  createPendingEmbed(username) {
    return this.createBasicEmbed().setDescription(`I am going over the books for you ${username}, please wait. :eyes:`);
  },

  createWordSearchEmbed(language, query, username, isDM, searchResults) {
    const embed = this.createBasicEmbed().setDescription(`Search results for: **${query}**`);
    if (searchResults.length === 0) {
      embed.addField('Error', 'No results have been found');
    } else {
      this.setEmbedFooter(embed, `${username} can toggle languages. ${!isDM ? 'Anyone can bookmark this message.' : ''}`);
      searchResults.forEach((entry) => {
        const defs = [];
        let j;
        if (entry.senses) {
          for (j = 0; j < entry.senses.length; j += 1) {
            const sense = entry.senses[j];
            let d;
            if (language === 'en') {
              d = `${j + 1}. __${sense.meaning}__\r\n${sense.translation}`;
            } else if (language === 'ko') {
              d = `${j + 1}. __${sense.meaning}__\r\n${sense.definition}`;
            }
            if (`${defs.join('\n')}\n${d}`.length < 1024) {
              defs.push(d);
            }
          }
        }
        if (language === 'en') {
          embed.addField(`**${entry.word}**${entry.hanja ? ` (${entry.hanja})` : ''} - ${entry.wordTypeTranslated}${entry.pronunciation ? ` - [${entry.pronunciation}]` : ''}${entry.stars > 0 ? '  ' + '★'.repeat(entry.stars) : ''}`, defs.join('\n'));
        } else if (language === 'ko') {
          embed.addField(`**${entry.word}**${entry.hanja ? ` (${entry.hanja})` : ''} - ${entry.wordType}${entry.pronunciation ? ` - [${entry.pronunciation}]` : ''}${entry.stars > 0 ? '  ' + '★'.repeat(entry.stars) : ''}`, defs.join('\n'));
        }
      });
    }
    return embed;
  },

  createHanjaEmbeds(query, username, isDM, results) {
    const pages = [];
    const isEmpty = results.similarwords.length === 0 && results.hanjas.length === 0;
    if (isEmpty) {
      const embed = this.createBasicEmbed().setDescription(`Search results for: **${query}**`);
      embed.addField('Error', 'No results have been found');
      pages.push(embed);
    } else {
      const pageLength = 10;
      let counter = 0;
      while (results.hanjas.length > 0 || results.similarwords.length > 0) {
        const page = this.createBasicEmbed().setDescription(`Search results for: **${query}**`);
        let i;
        const hanjas = [];
        const words = [];
        for (i = 0; i < pageLength; i += 1) {
          if (results.hanjas.length > 0) {
            const hanja = results.hanjas.shift();
            hanjas.push(`${counter + 1}. **${hanja.hanja}**\r\n${hanja.definition}`);
            counter += 1;
          } else if (results.similarwords.length > 0) {
            const word = results.similarwords.shift();
            words.push(`${counter + 1}. **${word.hanja}** **(${word.hangul})**\r\n${word.english}`);
            counter += 1;
          }
        }

        if (hanjas.length > 0) {
          page.addField('Hanjas', hanjas.join('\r\n'));
        }
        if (words.length > 0) {
          page.addField('Related Words', words.join('\r\n'));
        }

        pages.push(page);
      }
    }
    const pageCount = pages.length;
    if (pageCount > 1) {
      pages.forEach((page, index) => {
        page.setAuthor(`Sejong (Page ${index + 1} of ${pageCount})`, 'https://i.imgur.com/v95B0db.jpg');
        this.setEmbedFooter(page, `${username} can browse pages. ${!isDM ? 'Anyone can bookmark this message.' : ''}`);
      });
    } else if (pageCount === 1 && !isEmpty) {
      this.setEmbedFooter(pages[0], 'Anyone can bookmark this message.');
    }
    return pages;
  },

  createExampleResultEmbed(language, query, username, isDM, searchResults) {
    const embed = this.createBasicEmbed().setDescription(`Example Sentences for for: **${query}**`);
    if (searchResults.length === 0) {
      embed.addField('Error', 'No results have been found');
    } else {
      let s = `Example sentences for **${query}**:\r\n\r\n`;
      let i;
      for (i = 0; i < searchResults.length; i += 1) {
        s += `**${i + 1}.** ${searchResults[i].example.replace(query, `**__${query}__**`)}\r\n\r\n`;
      }
      embed.setDescription(s);
      if (!isDM) {
        this.setEmbedFooter(embed, 'Anyone can bookmark this message.');
      }
    }
    return embed;
  },

  createTranslationResultEmbed(result) {
    const embed = this.createBasicEmbed();
    this.setEmbedFooter(embed, 'Powered by Papago');
    if (!result) {
      embed.addField('Error', 'No results have been found');
    } else {
      embed.addField('Result', result.text);
      embed.addField('Original Language', langs[result.source], true);
      embed.addField('Target Language', langs[result.target], true);
      this.setEmbedFooter(embed, 'Anyone can bookmark this message.');
    }
    return embed;
  },

  createHelpEmbed(commands) {
    const embed = this.createBasicEmbed('Sejong (made by @Marvin#1997)').setDescription(`Use **${prefix}help <command>** to see information about a specific command.`);
    commands.forEach((c) => {
      if (c.name === 'help') return;
      if (c.devOnly) return;
      const {
        name,
        aliases,
        description,
        usage,
      } = c;

      const descriptionAndUsage = description + (usage ? `\r\n __(Ex. ${usage})__` : '');
      const title = `${prefix}${name} ${aliases ? `(short: ${aliases.map(e => prefix + e).join(', ')})` : ''}`;
      embed.addField(title, descriptionAndUsage);
    });
    return embed;
  },

  createDetailHelpEmbed(command) {
    const embed = this.createBasicEmbed().setDescription(`**${prefix}${command.name} ${command.aliases ? `(short: ${command.aliases.map(e => prefix + e).join(', ')})` : ''}**\r\n${command.longdescription ? command.longdescription : command.description}`);
    if (command.usage) {
      embed.addField('Usage Example', command.usage ? command.usage : 'None', true);
    }
    embed.addField('Cooldown', command.cooldown ? `${command.cooldown} seconds` : 'None', true);
    return embed;
  },
};
