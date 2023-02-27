from discord.ext import bridge, commands
from discord.ext.commands import BucketType
from discord.ext.pages import Paginator

from cogs.hanja.utils import get_hanja, get_hanja_embeds


class HanjaCog(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @bridge.bridge_command(name="hanja", aliases=["h"], description="Search for Hanja in English, Korean or Hanja itself.")
    @commands.cooldown(rate=4, per=60.0, type=BucketType.user)
    async def hanja(self, ctx, *, query):
        await ctx.defer()

        try:
            results = await get_hanja(query)
            embeds = get_hanja_embeds(results)
        except Exception as e:
            await ctx.respond(f"An error occurred while searching for the word **{query}**. Please try again later.")
            raise e

        if len(results.similar_words) == 0 and len(results.hanjas) == 0:
            embed = get_hanja_embeds(results)
            embed.add_field(name="Ooops.", value="No results were found.")
            await ctx.respond(embed=embed)
            return

        paginator = Paginator(pages=embeds, use_default_buttons=True, show_disabled=False)
        await paginator.respond(ctx, ephemeral=False)

def setup(bot):
    bot.add_cog(HanjaCog(bot))
