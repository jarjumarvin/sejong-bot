const request = require('request');
const cheerio = require('cheerio');

module.exports = class KrDicApi {
  parseResult(html, maxSenses) {
    const $ = cheerio.load(html, { normalizeWhitespace: true });
    this.entries = $('.search_list').children();
    const count = this.entries.length;
    const dicEntries = [];
    let i;
    for (i = 0; i < count; i += 1) {
      const dicEntry = {};

      const entry = $(this.entries).eq(i).children();
      const title = entry.eq(0);

      dicEntry.word = $(title).find('a').eq(0).text()
        .replace(/\s+/g, ' ')
        .trim();
      const h = title.text().match(/\(.*\)/);
      const p = title.text().match(/\[(.*?)\]/);

      let s;

      if ($(title).find('.score_3').length > 0) s = 3;
      else if ($(title).find('.score_2').length > 0) s = 2;
      else if ($(title).find('.score_1').length > 0) s = 1;
      else s = 0;

      dicEntry.stars = s;

      let hanja;
      if (h) {
        hanja = h[0].slice(1, -1).trim();
      }
      dicEntry.hanja = hanja;

      let pronunciation;
      if (p && p[1]) {
        pronunciation = p[1].trim();
      }

      dicEntry.pronunciation = pronunciation;
  
      dicEntry.wordType = $(title).find('em').eq(0).text()
        .replace(/\s+/g, ' ')
        .trim();

      dicEntry.wordTypeTranslated = $(title).find('em').eq(1).text()
        .replace(/\s+/g, ' ')
        .trim();

      const senses = $(entry).eq(1).children();
      const entrySenses = [];
      let j;
      for (j = 0; j < senses.length; j += 1) {
        if(maxSenses && j > maxSenses) break;
        const current = senses.eq(j).children();
        const sense = {};
        sense.meaning = current.eq(0).text()
          .replace(/\s+/g, ' ')
          .replace(/\d*\.\d*/, '')
          .trim();

        sense.definition = current.eq(1).text().replace(/\s+/g, ' ').trim();
        sense.translation = current.eq(2).text().replace(/\s+/g, ' ').trim();
        entrySenses.push(sense);
      }
      dicEntry.senses = entrySenses;
      dicEntries.push(dicEntry);
    }

    if (dicEntries.length === 1 && dicEntries[0].word === '') return [];
    return dicEntries;
  }

  searchWords(q, amount) {
    this.url = `https://krdict.korean.go.kr/eng/dicSearch/search?nation=eng&sort=C&nationCode=6&ParaWordNo=&blockCount=${amount}&mainSearchWord=${q}`;
    const promise = new Promise((resolve, reject) => {
      request(encodeURI(this.url), (error, response, body) => {
        if (!error && response.statusCode === 200) resolve(this.parseResult(body));
        else reject(error);
      });
    });
    return promise;
  }
};