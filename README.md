# Who is Sejong-bot?
Sejong-bot is a Korean language bot targeted towards Korean learners and enthusiats. It supports features such as word definitions in Korean and English, example sentences and neural machine translation. Users can also bookmark past searches to their DM's.

## Data Sources
- [Dictionary](https://krdict.korean.go.kr/openApi/openApiInfo)
    - Korean vocabulary definitions and their English translations
    - Example sentences
- [Papago NMT](https://developers.naver.com/docs/nmt/reference/)
    - Neural machine translation service supporting multiple languages

## Commands

### ~word (~w)
<img src="https://i.imgur.com/j7JXgls.png" width="450px">

This command performs a dictionary search for a given parameter presents the results to the user in a precise manner. Results include the word-type, as well as the meanings of the word both in English and in Korean. Users can use reactions to switch the language of the meanings or bookmark the result.

### ~examples (~e)
<img src="https://i.imgur.com/j7JXgls.png" width="450px">

Returns a list of Korean example sentences including a word given. Users can bookmark the result.

### ~papago (~p, ~ppg)
<img src="https://i.imgur.com/enoeuWF.png" width="450px">

Uses Papago's Neural Machine Translation to translate a given text between two given languages. Translates from Korean to English by default but users can specify source and target language using `~papago en>ko`. Available language codes can be seen using `~help papago`.

## Installation

### Dependencies
* Node.js

### Running:
- Generate a [Discord token](https://discordapp.com/developers/applications/), a [한국어기초사전 OPEN API](https://krdict.korean.go.kr/openApi/openApiInfo) token, and a [Papago NMT API](https://developers.naver.com/docs/nmt/reference/) client ID and secret.
- Create file `apiconfig.json` in the root directy and fill in the secrets from above. These values are used to fetch data for the various commands of Sejong-bot.
```json
{
    "discord_token": "",
    "krdict_url": "https://krdict.korean.go.kr/api/",
    "krdict_token": "",
    "papago_url": "https://openapi.naver.com/v1/papago/n2mt",
    "papago_client_id": "",
    "papago_client_secret": ""
}
```
- Run `npm install` and once all packages have been installed, start the bot using `npm start`.
