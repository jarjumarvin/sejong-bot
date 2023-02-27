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

async def get_hanja(query: str):
    async with aiosqlite.connect(settings["sql_file"]) as db:
        result = HanjaResult(query=query)

        q1 = await db.execute(
            "select hanja, hangul, english from (select hanja, hangul, english from hanjas where hidden_index match {query} union select hanja, hangul, english from hanjas where english match {query} union select hanja, hangul, english from hanjas where hangul match {query} union select hanja, hangul, english from hanjas where hanjas match {query}) order by hangul".format(query=f"'{query}'")

        )

        similar_words = await q1.fetchall()

        result.similar_words = [HanjaWord(hanja=sw[0], hangul=sw[1], english=sw[2]) for sw in similar_words]

        for c in query:
            q2 = await db.execute(f"select hanjas, definition from hanja_definition where hanjas = '{c}'")

            hanjas = await(q2.fetchall())


            result.hanjas.extend([HanjaDefinition(hanja=h[0], definition=h[1]) for h in hanjas])

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
        sub = l[i:i+10]

        embed = discord.Embed(
            type="rich",
            title=f"Hanja Results for **{result.query}**",
            color=settings["accent"],
        )

        for element in sub:
            if isinstance(element, HanjaDefinition):
                embed.add_field(name=element.hanja, value=element.definition, inline=False)
            elif isinstance(element, HanjaWord):
                embed.add_field(name=f"{element.hanja} ({element.hangul})", value=element.english, inline=False)

        embeds.append(embed)

    return embeds
