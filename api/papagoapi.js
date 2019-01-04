const request = require('request');
const Promise = require('promise');
const { papagoUrl, papagoClientId, papagoClientSecret } = require('../apiconfig.json');

module.exports = class Papago {
  translate(text, source, target) {
    this.options = {
      url: papagoUrl,
      form: {
        source,
        target,
        text,
      },
      headers: {
        'X-Naver-Client-Id': papagoClientId,
        'X-Naver-Client-Secret': papagoClientSecret,
      },
    };

    return new Promise((resolve, reject) => {
      request.post(this.options, (error, response, body) => {
        if (!error && response.statusCode === 200) {
          const { result } = JSON.parse(body).message;
          resolve({
            text: result.translatedText,
            source: result.srcLangType,
            target: result.tarLangType,
          });
        } else reject(error);
      });
    });
  }
};
