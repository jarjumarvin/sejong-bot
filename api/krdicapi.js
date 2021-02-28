const request = require('request');
const cheerio = require('cheerio');

module.exports = class KrDicApi {
  parseResult(html, maxSenses) {
    const $ = cheerio.load(html, { normalizeWhitespace: true });
    this.entries = $('.search_result').children();
    const count = this.entries.length;
    const dicEntries = [];
    let i;
    for (i = 0; i < Math.min(count, 5); i += 1) {
      const dicEntry = {};

      const title = $(this.entries).eq(i).children().eq(0);

      const senses = $(this.entries).eq(i).find('dd')

      dicEntry.word = $(title).remove('sup').find('a').eq(0).text()
        .replace(/[0-9]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      const h = title.text().match(/\(.*\)/);
      const p = title.text().match(/\[(.*?)\]/);

      dicEntry.stars = $(title).find('.star').eq(0).children().length;

      let hanja;
      if (h) {
        hanja = h[0].slice(1, -1).trim();
      }
      dicEntry.hanja = hanja;

      let pronunciation;
      if (p && p[1]) {
        pronunciation = p[1].replace("듣기", "").trim();
      }

      dicEntry.pronunciation = pronunciation;
  
      let word_type;
      word_type = $(title).find('.word_att_type1').eq(0).text()
        .replace("「", "")
        .replace("」", "")
        .replace(/\s+/g, ' ')
        .trim()
        .split(" ")

      dicEntry.wordType = word_type[0]
      dicEntry.wordTypeTranslated = word_type[1]


      const entrySenses = [];
      let j;

      for(j = 0; j < senses.length; j += 3) {
        const sense = {};

        sense.meaning = senses.eq(j).text().trim().replace(/^[0-9]\./, '').replace(/\s+/g, ' ').trim()
        sense.definition = senses.eq(j + 1).text().replace(/\s+/g, ' ').trim()
        sense.translation = senses.eq(j + 2).text().replace(/\s+/g, ' ').trim()

        entrySenses.push(sense);
      }
      dicEntry.senses = entrySenses;

      dicEntries.push(dicEntry);
    }

    if (dicEntries.length === 1 && dicEntries[0].word === '') return [];
    return dicEntries;
  }

  searchWords(q, amount) {
    this.url = `https://krdict.korean.go.kr/eng/dicSearch/search?nation=eng&nationCode=6&ParaWordNo=&mainSearchWord=${q}&blockCount=${amount}`;
    const promise = new Promise((resolve, reject) => {
      request(encodeURI(this.url), (error, response, body) => {
        if (!error && response.statusCode === 200) resolve(this.parseResult(body));
        else reject(error);
      });
    });
    return promise;
  }
};