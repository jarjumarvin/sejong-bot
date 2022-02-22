const request = require('request');
const fs = require('fs');
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
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
    };

    return new Promise((resolve, reject) => {
      request.post(this.options, (error, response, body) => {
        try {
          const { result } = JSON.parse(body).message;
          resolve({
            text: result.translatedText,
            source: result.srcLangType,
            target: result.tarLangType,
          });
        } catch(error){
          console.log(error);
        }
      });
    });
  }
};
