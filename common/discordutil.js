const Discord = require('discord.js');
const { prefix, accentColor, avatar } = require('../config.json');
const types = require('./pos.js');
const langs = require('./langs.js');

module.exports = {
  createBasicEmbed(name) {
    return new Discord.RichEmbed()
      .setColor(accentColor)
      .setAuthor(name || 'Sejong', 'https://i.imgur.com/v95B0db.jpg');
  },
  createPendingEmbed(username) {
    return this.createBasicEmbed().setDescription(`I am going over the books for you ${username}, please wait. :eyes:`);
  },
  createSearchResultEmbed(language, query, username, isDM, searchResults) {
    const embed = this.createBasicEmbed().setDescription(`Search results for: **${query}**`);
    if (searchResults.length === 0) {
      embed.addField('Error', 'No results have been found');
    } else {
      this.setEmbedFooter(embed, `${username} can toggle languages. ${!isDM ? 'Anyone can bookmark the result.' : ''}`);
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
        s += `**${i + 1}.** ${searchResults[i].example.replace(query, `**__${query}__**`)}\r\n\r\n`;
      }
      embed.setDescription(s);
      if (!isDM) {
        this.setEmbedFooter(embed, 'Anyone can bookmark this result using the book reaction.');
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
    }
    return embed;
  },
  setEmbedFooter(embed, footer) {
    embed.setFooter(footer, avatar);
  },
  createHelpEmbed(commands) {
    const embed = this.createBasicEmbed('Sejong (made by @Marvin#1997)').setDescription(`Use **${prefix}help <command>** to see information about a specific command.`);
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
  createDevSearchEmbed(language, query, username, isDM, searchResults) {
    const embed = this.createBasicEmbed().setDescription(`Search results for: **${query}**`);
    if (searchResults.length === 0) {
      embed.addField('Error', 'No results have been found');
    } else {
      this.setEmbedFooter(embed, `${username} can toggle languages. ${!isDM ? 'Anyone can bookmark the result.' : ''}`);
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
            defs.push(d);
          }
        }
        if (language === 'en') {
          embed.addField(`${entry.word} ${entry.hanja ? ` (${entry.hanja}) ` : ''} (${entry.wordTypeTranslated})`, defs.join('\n'));
        } else if (language === 'ko') {
          embed.addField(`${entry.word} ${entry.hanja ? ` (${entry.hanja}) ` : ''} (${entry.wordType})`, defs.join('\n'));
        }
      });
    }
    return embed;
  },
  createHanjaEmbeds(query, username, isDM, results) {
    const pages = [];
    if (results.similarwords.length === 0 && results.hanjas.length === 0) {
      const embed = this.createBasicEmbed().setDescription(`Search results for: **${query}**`);
      embed.addField('Error', 'No results have been found');
      pages.push(embed);
    } else {
      const total = results.hanjas.length + results.similarwords.length;
      const pageLength = 10;
      let embed = this.createBasicEmbed().setDescription(`Search results for: **${query}**`);
      let counter = 0;
      let currentHanjas = [];
      let currentSimilarWords = [];
      let hanjaCount = 0;
      let similarWordCount = 0;
      for (let i = total; i >= 0; i -= 1) {
        if ((counter !== 0 && counter % pageLength === 0) || i === 0) {
          if (currentHanjas.length > 0) {
            const hanja = results.hanjas.shift();
            if (hanja) {
              currentHanjas.push(`${hanjaCount + 1}. **${hanja.hanja}**\r\n${hanja.definition}`);
              hanjaCount += 1;
            }
            embed.addField('Hanjas', currentHanjas.join('\r\n'));
          }
          if (currentSimilarWords.length > 0) {
            const word = results.similarwords.shift();
            if (word) {
              currentSimilarWords.push(`${similarWordCount + 1}. **${word.hanja}** **(${word.hangul})**\r\n${word.english}`);
              similarWordCount += 1;
            }
            embed.addField('Related Words', currentSimilarWords.join('\r\n'));
          }
          currentHanjas = [];
          currentSimilarWords = [];
          pages.push(embed);
          embed = this.createBasicEmbed().setDescription(`Search results for: **${query}**`);
        }
        if (results.hanjas.length) {
          const hanja = results.hanjas.shift();
          currentHanjas.push(`${hanjaCount + 1}. **${hanja.hanja}**\r\n${hanja.definition}`);
          hanjaCount += 1;
        } else if (results.similarwords.length) {
          const word = results.similarwords.shift();
          currentSimilarWords.push(`${similarWordCount + 1}. **${word.hanja}** - **${word.hangul}**\r\n${word.english}`);
          similarWordCount += 1;
        }
        counter += 1;
      }
    }
    const pageCount = pages.length;
    if (pageCount > 1) {
      pages.forEach((page, index) => {
        page.setAuthor(`Sejong (Page ${index + 1} of ${pageCount})`, 'https://i.imgur.com/v95B0db.jpg');
      });
    }
    return pages;
  },
};
