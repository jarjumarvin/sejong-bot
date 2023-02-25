import discord
from discord.ext import pages
from discord.ext.commands import cooldowns, cooldown, CommandOnCooldown, is_owner

import sys
from loguru import logger
logger.remove(0)
logger.add(sys.stderr, format="{time:YYYY-MM-DD at HH:mm:ss} | {level} | {message}")
logger.add("sejong.log", format="{time:YYYY-MM-DD at HH:mm:ss} | {level} | {message}")

from config import settings
from utils.hanja import get_hanja, get_hanja_embeds
from utils.krdic import get_dictionary_embed, parse_response, query_dictionary

bot = discord.Bot(command_prefix="~", intents=discord.Intents.all())

@bot.event
async def on_ready():
  logger.info(f"{bot.user} is online on {len(bot.guilds)} servers with {sum([guild.member_count for guild in bot.guilds])} members.")

@bot.slash_command(name="dictionary", description="Searches the dictionary for the Korean word provided and lists found results with definitions.")
@cooldown(rate=4, per=60.0, type=cooldowns.BucketType.user)
async def dictionary(ctx, word):
    logger.info(f"dictionary command used by {ctx.author} ({ctx.author.id}) in '{ctx.guild}' ({ctx.guild.id}) with arguments: {word}")
    await ctx.response.defer()

    try:
        html = query_dictionary(word)
        result = parse_response(html)
    except Exception as e:
        await ctx.respond(f"An error occurred while searching for the word **{word}**. Please try again later.")
        raise e

    embeds = [get_dictionary_embed(word, result, lang) for lang in ["en", "kr"]]

    buttons = [
        pages.PaginatorButton("prev", label="English Definitions", emoji=settings["english_flag"], style=discord.ButtonStyle.primary),
        pages.PaginatorButton("next", label="Korean Definitions", emoji=settings["korean_flag"], style=discord.ButtonStyle.primary),
    ]

    paginator = pages.Paginator(pages=embeds, use_default_buttons=False, show_indicator=False, custom_buttons=buttons, show_disabled=False)

    await paginator.respond(ctx.interaction, ephemeral=False)


@bot.slash_command(name="hanja", description="get hanja")
@cooldown(rate=4, per=60.0, type=cooldowns.BucketType.user)
async def hanja(ctx, query):
    logger.info(f"hanja command used by {ctx.author} (ctx.author.id) in '{ctx.guild}' (ctx.guild.id) with arguments: {query}")
    await ctx.response.defer()

    try:
        results = await get_hanja(query)
        embeds = get_hanja_embeds(results)
    except Exception as e:
        await ctx.respond(f"An error occurred while searching for the word **{query}**. Please try again later.")
        raise e

    paginator = pages.Paginator(pages=embeds, use_default_buttons=True, show_indicator=False, show_disabled=False)
    await paginator.respond(ctx.interaction, ephemeral=False)


@bot.slash_command(name="help", description="Invite Link & Support Discord Invite")
async def help(ctx):
    await ctx.respond(f"Use <https://discordapp.com/oauth2/authorize?client_id={bot.user.id}&scope=bot&permissions=60480> to invite me to your server. \n\nUse {settings['support_discord']} for any questions and inquiries regarding Sejong. Feel free to mention @Marvin#1997.", ephemeral=True)


@bot.command(name="stats")
@is_owner()
async def stats(ctx):
    guilds = len(bot.guilds)
    members = sum([guild.member_count for guild in bot.guilds])

    await ctx.send(f"Sejong is currently on {guilds} servers with a total of {members} members.")


@bot.event
async def on_message(message: discord.Message):
    if "sejong" in message.content.lower():
        emoji = bot.get_emoji(580466307044999201)
        if emoji:
            await message.add_reaction(emoji)


@bot.event
async def on_application_command_error(ctx: discord.ApplicationContext, error: discord.DiscordException):
    if isinstance(error, CommandOnCooldown):
        await ctx.respond(f"This command is currently on cooldown! Try again in {int(error.retry_after)}s.")
    else:
        logger.error(error)
        raise error  # Here we raise other errors to ensure they aren't ignored

bot.run(settings["token"])
