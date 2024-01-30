import discord
from discord.ext import bridge, commands
from discord.ext.commands import BucketType
from discord.ext.pages import Paginator, PaginatorButton

from cogs.dictionary.utils import (
    get_dictionary_embed,
    get_examples,
    get_examples_embed,
    parse_response,
    query_dictionary,
)
from config import settings


class DictionaryCog(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @bridge.bridge_command(
        name="dictionary",
        aliases=["d", "w"],
        description="Searches the dictionary for a Korean word, lists results from NIKL with definitions.",
    )
    @commands.cooldown(rate=1, per=20.0, type=BucketType.user)
    async def dictionary(self, ctx, *, word):
        await ctx.defer()

        try:
            html = query_dictionary(word)
            result = parse_response(html)
        except Exception as e:
            await ctx.respond(
                f"An error occurred while searching for the word **{word}**. Please try again later."
            )
            raise e

        if len(result.entries) == 0:
            embed = get_dictionary_embed(word, result)
            embed.add_field(name="Ooops.", value="No results were found.")
            await ctx.respond(embed=embed)
            return

        embeds = [get_dictionary_embed(word, result, lang) for lang in ["en", "kr"]]

        buttons = [
            PaginatorButton(
                "prev",
                label="English Definitions",
                emoji=settings["english_flag"],
                style=discord.ButtonStyle.primary,
            ),
            PaginatorButton(
                "next",
                label="Korean Definitions",
                emoji=settings["korean_flag"],
                style=discord.ButtonStyle.primary,
            ),
        ]

        paginator = Paginator(
            pages=embeds,
            use_default_buttons=False,
            show_indicator=False,
            custom_buttons=buttons,
            show_disabled=False,
        )
        await paginator.respond(ctx, ephemeral=False)

    @bridge.bridge_command(
        name="examples",
        aliases=["e"],
        description="Searches the dictionary for sentences containing a given Korean word.",
    )
    @commands.cooldown(rate=1, per=20.0, type=BucketType.user)
    async def examples(self, ctx, *, word):
        await ctx.defer()

        try:
            result = get_examples(word)
        except Exception as e:
            await ctx.respond(
                f"An error occurred while searching for sentences containing the word **{word}**. Please try again later."
            )
            raise e

        if len(result.entries) == 0:
            embed = get_examples_embed(word, result)
            embed.add_field(name="Ooops.", value="No results were found.")
            await ctx.respond(embed=embed)
            return

        embed = get_examples_embed(word, result)

        await ctx.respond(embed=embed)


def setup(bot):
    bot.add_cog(DictionaryCog(bot))
