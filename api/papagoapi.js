const request = require('request');
const querystring = require('querystring');
const Promise = require('promise');
const { papago_url, papago_client_id, papago_client_secret } = require('../apiconfig.json');

module.exports = class Papago {
    translate(text, source, target) {
        const options = {
            url: papago_url,
            form: {
                'source': source,
                'target': target,
                'text': text,
            },
            headers: {
                'X-Naver-Client-Id':papago_client_id,
                'X-Naver-Client-Secret': papago_client_secret
            },
        };
        return new Promise( (resolve, reject) => {
            request.post(options, function(error, response, body) {
                if(!error && response.statusCode == 200) resolve(body);
                else reject(error);
            });
        });
    }
}
