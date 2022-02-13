const got = require('got');
const cheerio = require('cheerio');

module.exports = class KrDicApi {
  parseResult(html, maxSenses) {
    const $ = cheerio.load(html, { normalizeWhitespace: true });
    this.entries = $('.search_result').children();
    const count = this.entries.length;
    const dicEntries = [];
    let i;
    for (i = 0; i < count; i += 1) {
      const dicEntry = {};

      const entry = $(this.entries).eq(i).children();
      const title = entry.eq(0);

      dicEntry.word = $(title).remove('sup').find('a').eq(0).text()
        .replace(/\s+/g, ' ')
        .replace(/[0-9]/g, '')
        .trim();
      const h = title.text().match(/\(.*\)/);
      const p = title.text().match(/\[(.*?)\]/);

      let s = $(entry).find('.star').children().length; 

      dicEntry.stars = s;

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

      let wordTypes = $(title).find('.word_att_type1').text()
        .replace('「',"")
        .replace('」',"")
        .replace(/\s+/g, ' ')
        .trim()
        .split(' ');

      dicEntry.wordType = wordTypes[0];
      dicEntry.wordTypeTranslated = wordTypes[1];

      const senses = $(this.entries).eq(i).find('dd')
      const entrySenses = [];
      let j;
      for(j = 0; j < senses.length; j += 3) {
        const sense = {};
        sense.meaning = senses.eq(j).text().trim().replace(/\d+/g, '').replace(/\s+/g, ' ').replace('. ', '').trim();
        sense.definition = senses.eq(j + 1).text().replace(/\s+/g, ' ').trim();
        sense.translation = senses.eq(j + 2).text().replace(/\s+/g, ' ').trim();  
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
    const promise = new Promise((resolve, reject) =>(async () => {
      try {
        const options = {
          https: {
            rejectUnauthorized: false
          }
        };
        
        const response = await got(this.url, options);
        resolve(this.parseResult(response.body));
        //=> '<!doctype html> ...'
      } catch (error) {
        console.log(error);
        //=> 'Internal server error ...'
      }
    })());
    return promise;
  }
};