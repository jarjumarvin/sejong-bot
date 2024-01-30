from typing import List

import aiosqlite
import discord
import pydantic

from config import settings


class HanjaWord(pydantic.BaseModel):
    hanja: str
    hangul: str
    english: str


class HanjaDefinition(pydantic.BaseModel):
    hanja: str
    definition: str


class HanjaResult(pydantic.BaseModel):
    query: str
    similar_words: List[HanjaWord] = []
    hanjas: List[HanjaDefinition] = []


HANJA_QUERY_1 = """
    SELECT hanja, hangul, english 
    FROM (
        SELECT hanja, hangul, english 
        FROM hanjas 
        WHERE hidden_index MATCH {query} 
        UNION (
            SELECT hanja, hangul, english FROM hanjas WHERE english match {query}
            UNION
            SELECT hanja, hangul, english FROM hanjas WHERE hangul match {query}
            UNION
            SELECT hanja, hangul, english FROM hanjas WHERE hanjas match {query}
        )
    ORDER BY hangul
"""

HANJA_QUERY_2 = """
    SELECT hanjas, definition 
    FROM hanja_definition
    WHERE hanjas = '{character}'
"""


async def get_hanja(query: str):
    query = f"'{query.strip()}'"
    async with aiosqlite.connect(settings["sql_file"]) as db:
        result = HanjaResult(query=query)

        q1 = await db.execute(HANJA_QUERY_1.format(query=query))

        similar_words = await q1.fetchall()

        result.similar_words = [
            HanjaWord(hanja=sw[0], hangul=sw[1], english=sw[2]) for sw in similar_words
        ]

        for c in query:
            q2 = await db.execute(HANJA_QUERY_2.format(character=c))

            hanjas = await q2.fetchall()

            result.hanjas.extend(
                [HanjaDefinition(hanja=h[0], definition=h[1]) for h in hanjas]
            )

        return result


def get_hanja_embeds(result: HanjaResult):
    l = result.similar_words + result.hanjas

    embeds = []

    if len(l) == 0:
        embed = discord.Embed(
            type="rich",
            title=f"Hanja Results for **{result.query}**",
            color=settings["accent"],
        )

        return embed

    for i in range(0, len(l), 10):
        sub = l[i : i + 10]

        embed = discord.Embed(
            type="rich",
            title=f"Hanja Results for **{result.query}**",
            color=settings["accent"],
        )

        for element in sub:
            if isinstance(element, HanjaDefinition):
                embed.add_field(
                    name=element.hanja, value=element.definition, inline=False
                )
            elif isinstance(element, HanjaWord):
                embed.add_field(
                    name=f"{element.hanja} ({element.hangul})",
                    value=element.english,
                    inline=False,
                )

        embeds.append(embed)

    return embeds
