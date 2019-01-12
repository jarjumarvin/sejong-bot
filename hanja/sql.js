const Sequelize = require('sequelize');

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index += 1) {
    await callback(array[index], index, array);
  }
}

module.exports = class Hanja {
  constructor() {
    this.sequelize = new Sequelize('database', 'username', 'password', {
      host: 'localhost',
      dialect: 'sqlite',
      operatorsAliases: false,
      logging: false,

      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },

      // SQLite only
      storage: './hanja/hanjadic.sqlite',
    });
    this.SimilarWord = this.sequelize.define('similarword', {
      hanja: Sequelize.STRING,
      hangul: Sequelize.STRING,
      english: Sequelize.STRING,
    });

    this.Hanja = this.sequelize.define('hanja', {
      hanjas: Sequelize.STRING,
      definition: Sequelize.STRING,
    });
  }

  async searchWords(args) {
    const results = {
      empty: true,
      query: args,
      similarwords: [],
      hanjas: [],
    };
    const query = `'*${args.join('*')}*'`;
    const similarwords = await this.sequelize
      .query(`select hanja, hangul, english from (select hanja, hangul, english from hanjas where hidden_index match ${query} union select hanja, hangul, english from hanjas where english match ${query} union select hanja, hangul, english from hanjas where hangul match ${query} union select hanja, hangul, english from hanjas where hanjas match ${query}) order by hangul`, {
        model: this.SimilarWord,
        mapToModel: true,
      });

    similarwords.forEach((similarword) => {
      const entry = {
        hanja: similarword.hanja,
        hangul: similarword.hangul,
        english: similarword.english,
      };
      results.similarwords.push(entry);
      results.empty = false;
    });

    const characters = [];
    args.forEach((arg) => {
      const split = arg.split('');
      split.forEach((char) => {
        characters.push(char);
      });
    });

    await asyncForEach(characters, async (character) => {
      const hanjas = await this.sequelize
        .query(`select hanjas, definition from hanja_definition where hanjas = '${character}'`, {
          model: this.Hanja,
          mapToModel: true,
        });

      hanjas.forEach((hanja) => {
        const entry = {
          hanja: hanja.hanjas,
          definition: hanja.definition,
        };
        results.hanjas.push(entry);
        results.empty = false;
      });
    });
    return results;
  }
};
