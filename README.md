# Who is Sejong-bot?
Sejong-bot is a Korean language bot targeted towards Korean learners and enthusiats. It supports features such as word definitions in Korean and English, example sentences and neural machine translation. Users can also bookmark past searches to their DM's.

# How do I invite Sejong-bot to my own server?

Use the following [invite link](https://discord.com/api/oauth2/authorize?client_id=529231054909865985&permissions=74752&scope=bot)!

A 'support' discord server can be found [here](https://discord.gg/EhGjg2drSQ). Feel free to ping me and ask questions. If you would like to support me as a creator, consider buying me a coffee below:

<a href="https://www.buymeacoffee.com/gbraad" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>

## Data Sources
- [Dictionary](https://krdict.korean.go.kr/openApi/openApiInfo)
    - Definitions and Word Info (scraped from .html)
    - Example sentences (through the API)
- Hanja database from [dbravender/hanjadic](https://github.com/dbravender/hanjadic)

## Commands

### /dictionary
<img src="https://i.imgur.com/Zlw00b7.gif" width="450px">

This command performs a dictionary search for a given parameter presents the results to the user in a precise manner. Results include the word-type, as well as the meanings of the word both in English and in Korean. Users can use reactions to switch the language of the meanings or bookmark the result.

### /hanja
<img src="https://i.imgur.com/N18cYT8.png" width="450px">
Searches the hanja database for meanings of hanjas and related words that occur in the provided argument. Scans the word an returns all relevant results including meaning of single hanjas, meanings of single hanjas, as well as related words.  Users can use reactions to browse pages of results or bookmark the result.

### /examples
<img src="https://i.imgur.com/j7JXgls.png" width="450px">

Returns a list of Korean example sentences including a word given. Users can bookmark the result.

## Development:

Requirements are given in ``requirements.txt``. Install using ``venv`` or however you prefer. I developed on Python 3.10.13, which is also the base-image of the Dockerfile if applicable to you.

- Generate a [Discord Bot Token](https://discordapp.com/developers/applications/), a [한국어기초사전 OPEN API Token](https://krdict.korean.go.kr/openApi/openApiInfo).
- Either use the env variables ``SEJONG_BOT_TOKEN`` and ``SEJONG_KRDIC_TOKEN``, or create a ``.env`` file in the project root of the following form:
    ```yaml
    BOT_TOKEN=<<DISCORD_TOKEN>>
    KRDIC_TOKEN=<<KRDIC_TOKEN>>
    ```
- Modify ``config/emojis.yaml`` and ``config/settings.yaml`` as required.
- Run using ``python main.py``
