const querystring = require('querystring');
const { krdict_url, krdict_token } = require('../apiconfig.json');
const request = require('request');
const et = require('elementtree');
const types = require('./pos.js');

module.exports = class KRDicApi {
    constructor() {
        this.sort = 'dict';
        this.sortOptions = {
            'Dictionary': 'dict',
            'Popular': 'popular'
        };

        this.method = 'exact';
        this.method_option = {
                'exact': 'exact',
                'include': 'include',
                'start': 'start',
                'end': 'end'
        };

        this.num = 10;
        this.translationEnabled = 'y';
        this.advancedEnabled = 'n';

        this.trans = 'English';
        this.transOptions = {
            'Full Translation': '0',
            'English': '1',
            'Japanese': '2',
            'French': '3',
            'Spanish': '4',
            'Arabic': '5',
            'Mongolian': '6',
            'Vietnamese': '7',
            'Russian': '8',
        };

        this.part = 'Word';
        this.partOptions = {
            'Word': 'word',
            'IP': 'ip',
            'Definition': 'dfn',
            'Examples': 'exam'
        };

        this.target = 'Headword';
        this.targetOptions = {
            'Headword': 1,
            'Solve': 2,
            'Examples': 3,
            'Original Language': 4,
            'Pronunciation': 5,
            'Utilization': 6,
            'Idiom': 7,
            'Proverb': 8,
        };

        this.multimedia = 'Full';
        this.multiMediaOptions = {
            'Full': 0,
            'Photo': 1,
            'Annealing': 2,
            'Video': 3,
            'Animation': 4,
            'Sound': 5,
            'None': 6
        };

        this.searchMethod = 'Exact';
        this.searchMethodOptions = {
            'Exact': 'exact',
            'Includ': 'include',
            'Start': 'start',
            'End': 'end'
        };

        this.start = 1;
        this.viewMethod = 'Word Info';

        this.viewMethodOptions = {
            'Word Info': 'word_info',
            'Target Code': 'target_code'
        };
    }

    searchExamples(q) {
        const url = krdict_url + 'search?' + querystring.stringify({
            'key': krdict_token,
            'type_search': 'search',
            'part': this.partOptions['Examples'],
            'method': this.method,
            'multimedia': this.multiMediaOptions[this.multimedia],
            'q': q,
            'sort': 'dict'
        });
        const options = {
            url: url,
            headers: {
                'content-type': 'application/xml',
                'Accept': 'application/xml'
            }
        }

        return new Promise( (resolve, reject) => {
            request(options, function(error, response, body) {
                if(!error && response.statusCode == 200) resolve(body);
                else reject(error);
            });
        });
    }

    searchWord(q) {
        const url = krdict_url + 'search?' + querystring.stringify({
            'key': krdict_token,
            'part': this.partOptions['Word'],
            'q': q,
            'translated': this.translationEnabled,
            'trans_lang': this.transOptions[this.trans],
            'advanced': this.advancedEnabled,
            'target': this.targetOptions[this.target],
            'multimedia': this.multiMediaOptions[this.multimedia],
            'start': this.start
        });

        const options = {
            url: url,
            headers: {
                'content-type': 'application/xml',
                'Accept': 'application/xml'
            }
        }

        let promise = new Promise( (resolve, reject) => {
            request(options, function(error, response, body) {
                if(!error && response.statusCode == 200) resolve(body);
                else reject(error);
            });
        });

        return promise;
    }

    parseExampleResult(r) {
        let dic_entries = [];
        const etree = et.parse(r);
        for(const item of etree.findall('item')) {
            const entry = { 'word': item.find('word').text }
            entry['example'] = item.find('example').text.trim();
            dic_entries.push(entry);
        }
        return dic_entries;
    }

    parseWordResult(r) {
        let dic_entries = [];
        const etree = et.parse(r);
        for(const item of etree.findall('item')) {
            let entry = {'word': item.find('word').text};
            let pos = item.find('pos').text;
            entry['pos'] = pos;
            entry['pos_trans'] = types[pos];
            let senses = item.findall('sense');
            entry['entry_definitions'] = [];
            for(var sense of senses) {
                var def = {
                    'definition_korean': sense.find('definition').text,
                    'definition_trans': sense.find('translation').find('trans_dfn').text
                };
                entry['entry_definitions'].push(def);
            }
            dic_entries.push(entry);
        }
        return dic_entries;
    }
}
