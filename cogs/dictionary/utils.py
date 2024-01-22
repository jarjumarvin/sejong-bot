import re
from typing import List, Literal, Optional

from bs4 import BeautifulSoup
import discord
import pydantic
import requests
import urllib3
from urllib3.connectionpool import InsecureRequestWarning
import xmltodict
from config import settings

urllib3.disable_warnings(InsecureRequestWarning)

BASE_URL = "https://krdict.korean.go.kr/eng/dicMarinerSearch/search?wordMatchFlag=N&mainSearchWord={word}&nation=eng&nationCode=6&blockCount={amount}"


class DictionarySense(pydantic.BaseModel):
    meaning: str
    definition_en: str
    definition_kr: str


class DictionaryEntry(pydantic.BaseModel):
    word: str
    hanja: Optional[str]
    pronunciation: Optional[str]
    word_type_en: str
    word_type_kr: str
    senses: List[DictionarySense]  # list of senses (meaning + definition)


class SearchResult(pydantic.BaseModel):
    entries: List[DictionaryEntry] = []


class ExamplesResult(pydantic.BaseModel):
    entries: List[str] = []


def query_dictionary(word: str) -> str:
    html = requests.get(url=BASE_URL.format(word=word, amount=5), verify=False).text

    return html


def parse_response(html: str):
    result = SearchResult()

    for entry in (
        BeautifulSoup(html, "lxml")
        .find("div", class_="search_result")
        .findChildren("dl")
    ):
        title = entry.find("dt")
        # Extract Word
        word = title.find("a").find("span")
        if word.sup:
            word.sup.decompose()

        word = word.text.strip()

        # Extract Hanja
        hanja = re.search(r"\(.*\)", title.text)

        if hanja:
            hanja = hanja.group(0)[1:-1]

        # Extract Pronunciation
        pronunciation = re.search(r"\[.*\]", title.text)

        if pronunciation:
            pronunciation = pronunciation.group(0)[1:-1].replace("듣기", "")

        # Extract Word Type
        word_type_kr = None
        word_type_en = None

        if title.find("span", class_="word_att_type1"):
            word_types = [
                t.strip()
                for t in re.sub(
                    r"\s+/g",
                    "",
                    title.find("span", class_="word_att_type1")
                    .text.replace("「", "")
                    .replace("」", ""),
                ).split()
            ]

            word_type_kr = word_types[0]
            word_type_en = word_types[1]

        # Extract Senses
        senses: List[DictionarySense] = []
        soup_senses = entry.find_all("dd")
        for meaning, definition_kr, definition_en in [
            (soup_senses[i].text, soup_senses[i + 1].text, soup_senses[i + 2].text)
            for i in range(0, len(soup_senses), 3)
        ]:
            # meaning
            meaning = re.sub(r"[0-9]*\.", "", meaning).strip()

            # definition_kr
            definition_kr = definition_kr.strip()

            # definition_en
            definition_en = definition_en.strip()

            senses.append(
                DictionarySense(
                    meaning=meaning,
                    definition_kr=definition_kr,
                    definition_en=definition_en,
                )
            )

        result.entries.append(
            DictionaryEntry(
                word=word,
                hanja=hanja,
                pronunciation=pronunciation,
                word_type_en=word_type_en,
                word_type_kr=word_type_kr,
                senses=senses,
            )
        )

    return result


def get_dictionary_embed(
    word: str, result: SearchResult, language: Literal["en", "kr"] = "en"
):
    embed = discord.Embed(
        type="rich",
        title=f"Search Results for {word}",
        color=settings["accent"],
    )

    for i, entry in enumerate(result.entries):
        title = (
            f"{i + 1}. "
            + entry.word
            + " - "
            + (entry.word_type_en if language == "en" else entry.word_type_kr)
        )
        if entry.hanja:
            title += f" - ({entry.hanja})"
        if entry.pronunciation:
            title += f" - 「{entry.pronunciation}」"

        defs = []

        for j, sense in enumerate(entry.senses):
            d = f"**{i+1}.{j+1}. {sense.meaning}**\r\n{sense.definition_en if language == 'en' else sense.definition_kr}"
            if len("\n".join(defs + [d])) < 1024:
                defs.append(d)

        embed.add_field(name=title, value="\n".join(defs), inline=False)

    return embed


def get_examples(word: str):
    result = ExamplesResult()

    r = requests.get(
        f"https://krdict.korean.go.kr/api/search?key={settings['krdic_token']}&part=exam&method=exact&q={word}",
        verify=False,
    )

    xml = xmltodict.parse(r.text)["channel"]

    if "item" in xml:
        result.entries = [
            item["example"].replace(word, f"**__{word}__**") for item in xml["item"]
        ]

    return result


def get_examples_embed(word: str, result: ExamplesResult):
    embed = discord.Embed(
        type="rich",
        title=f"Sentences containing: {word}",
        color=settings["accent"],
    )

    if len(result.entries) > 0:
        rows = []
        for i, example in enumerate(result.entries):
            rows.append(f"**{i+1}.** " + example)

        embed.description = "\n\n".join(rows)

    return embed
