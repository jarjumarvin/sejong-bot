const Discord = require('discord.js');
const { prefix, accentColor, avatar } = require('../config.json');
const types = require('./pos.js');
const langs = require('./langs.js');

module.exports = {
  createBasicEmbed() {
    return new Discord.RichEmbed()
      .setColor(accentColor)
      .setAuthor('Sejong', 'https://i.imgur.com/v95B0db.jpg');
  },
  createPendingEmbed(username) {
    return this.createBasicEmbed().setDescription(`I am going over the books for you ${username}, please wait. :eyes:`);
  },
  createSearchResultEmbed(language, query, username, isDM, searchResults) {
    const embed = this.createBasicEmbed().setDescription(`Search results for: **${query}**`);
    if (searchResults.length === 0) {
      embed.addField('Error', 'No results have been found');
    } else {
      this.setEmbedFooter(embed, `${username}, you can toggle languages ${!isDM ? 'or bookmark the result' : ''} using reactions.`);
      let big = 0;
      searchResults.forEach((entry) => {
        if (embed.fields.length < 6 && big < 2) {
          const defs = [];
          let j;
          for (j = 0; j < entry.entryDefinitions.length; j += 1) {
            if (j < 8) {
              if (language === 'en') {
                defs.push(`${j + 1}. ${entry.entryDefinitions[j].definitionTrans.trim()}`);
              }
              if (language === 'ko') {
                defs.push(`${j + 1}. ${entry.entryDefinitions[j].definitionKorean.trim()}`);
              }
            } else {
              big += 1;
              break;
            }
          }
          if (language === 'en') {
            embed.addField(`${entry.word} (${types[entry.pos]})`, defs.join('\n'));
          }
          if (language === 'ko') {
            embed.addField(`${entry.word} (${entry.pos})`, defs.join('\n'));
          }
        }
      });
    }
    return embed;
  },
  createExampleResultEmbed(language, query, username, isDM, searchResults) {
    const embed = this.createBasicEmbed().setDescription(`Example Sentences for for: **${query}**`);
    if (searchResults.length === 0) {
      embed.addField('Error', 'No results have been found');
    } else {
      let s = `Example sentences for **${query}**:\r\n\r\n`;
      let i;
      for (i = 0; i < searchResults.length; i += 1) {
        s += `**${i + 1}.** ${searchResults[i].example}\r\n\r\n`;
      }
      embed.setDescription(s);
      if (!isDM) {
        this.setEmbedFooter(embed, `${username}, you can bookmark the result using a reaction.`, 'https://i.imgur.com/v95B0db.jpg');
      }
    }
    return embed;
  },
  createTranslationResultEmbed(result) {
    const embed = this.createBasicEmbed();
    this.setEmbedFooter(embed, 'Powered by Papago');
    if (!result) {
      console.log('Error', result);
      embed.addField('Error', 'No results have been found');
    } else {
      embed.addField('Result', result.text);
      embed.addField('Original Language', langs[result.source], true);
      embed.addField('Target Language', langs[result.target], true);
    }
    return embed;
  },
  setEmbedFooter(embed, footer) {
    embed.setFooter(footer, avatar);
  },
  createHelpEmbed(commands) {
    const embed = this.createBasicEmbed().setDescription(`Use **${prefix}help <command>** or **${prefix}h <command>** to see information about a specific command.`);
    commands.forEach((c) => {
      if (c.name === 'help') return;
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
