const request = require('request');
const Promise = require('promise');
const {
  papago_url: papagoUrl,
  papago_client_id: papagoClientId,
  papago_client_secret: papagoClientSecret
} = require('../apiconfig.json');

module.exports = class Papago {
  translate(text, source, target, honorific) {
    this.options = {
      url: papagoUrl,
      form: {
        'source': source,
        'target': target,
        'text': text,
        'honorific': true,
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
