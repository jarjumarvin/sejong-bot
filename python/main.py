import discord

from config import settings

bot = discord.Bot()

@bot.event
async def on_ready():
  print(f"{bot.user} is online on {len(bot.guilds)} servers.")

@bot.slash_command(name = "hello", description = "Say hello to the bot")
async def hello(ctx):
    await ctx.respond("Hey!")

bot.run(settings["token"])