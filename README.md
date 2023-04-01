# DISCLAIMER

THIS README IS HEAVILY OUTDATED

Currently running version is on the python branch.

# Who is Sejong-bot?
Sejong-bot is a Korean language bot targeted towards Korean learners and enthusiats. It supports features such as word definitions in Korean and English, example sentences and neural machine translation. Users can also bookmark past searches to their DM's.

# How do I invite Sejong-bot to my own server?

Use the following [invite link](https://discord.com/api/oauth2/authorize?client_id=529231054909865985&permissions=74752&scope=bot)!

A 'support' discord server can be found [here](https://discord.gg/EhGjg2drSQ). Feel free to ping me and ask questions. If you would like to support me as a creator, consider buying me a coffee below:

<a href="https://www.buymeacoffee.com/gbraad" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>

## Data Sources
- [Dictionary](https://krdict.korean.go.kr/openApi/openApiInfo)
    - Example sentences
    - [Definitions and Word Info](https://github.com/jarjumarvin/krdict-api) from a scraper I made
- [Papago NMT](https://developers.naver.com/docs/nmt/reference/)
    - Neural machine translation service supporting multiple languages
- Hanja database from [dbravender/hanjadic](https://github.com/dbravender/hanjadic)

## Commands

### ~word (~w)
<img src="https://i.imgur.com/Zlw00b7.gif" width="450px">

This command performs a dictionary search for a given parameter presents the results to the user in a precise manner. Results include the word-type, as well as the meanings of the word both in English and in Korean. Users can use reactions to switch the language of the meanings or bookmark the result.

### ~hanja (~h)
<img src="https://i.imgur.com/N18cYT8.png" width="450px">
Searches the hanja database for meanings of hanjas and related words that occur in the provided argument. Scans the word an returns all relevant results including meaning of single hanjas, meanings of single hanjas, as well as related words.  Users can use reactions to browse pages of results or bookmark the result.

### ~examples (~e)
<img src="https://i.imgur.com/j7JXgls.png" width="450px">

Returns a list of Korean example sentences including a word given. Users can bookmark the result.

### ~papago (~p, ~ppg)
<img src="https://i.imgur.com/enoeuWF.png" width="450px">

Uses Papago's Neural Machine Translation to translate a given text between two given languages. Translates from Korean to English by default but users can specify source and target language using `~papago en>ko`. Available language codes can be seen using `~help papago`.

THIS COMMAND IS CURRENTLY DISABLED

## Installation

### Dependencies
* Node.js

### Running:
- Generate a [Discord token](https://discordapp.com/developers/applications/), a [한국어기초사전 OPEN API](https://krdict.korean.go.kr/openApi/openApiInfo) token, and a [Papago NMT API](https://developers.naver.com/docs/nmt/reference/) client ID and secret.
- Create file `apiconfig.json` in the root directory and fill in the secrets from above. These values are used to fetch data for the various commands of Sejong-bot.
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

- Create file `config.json` in the root directory and fill accordingly:
```json
{
    "prefix": "`",
    "accentColor": "#C27C0E",
    "avatar": "https://i.imgur.com/v95B0db.jpg",
    "status": ["WATCHING", "@ me for hangoolies help!"],
}
```

- Run `npm install` and once all packages have been installed, start the bot using `npm start`.
