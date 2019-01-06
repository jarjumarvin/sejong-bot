# Sejong-bot
A Discord bot for learners of the Korean language.

<div style="text-align:center"><img src ="https://i.ibb.co/SP91Rkx/image.png" /></div>

## Data Sources
- [Dictionary](https://krdict.korean.go.kr/openApi/openApiInfo)
    - Korean vocabulary definitions and their English translations
    - Example sentences
- [Papago NMT](https://developers.naver.com/docs/nmt/reference/)
    - Neural machine translation service supporting multiple languages

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
