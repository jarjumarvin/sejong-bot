import logging
import traceback

import discord
from discord.ext import bridge
from discord.ext.commands.errors import CommandNotFound, CommandOnCooldown

from config import settings

logger = logging.getLogger('discord')
logger.setLevel(logging.DEBUG)
handler = logging.FileHandler(filename=settings["log_dir"], encoding='utf-8', mode='a')
handler.setFormatter(logging.Formatter('%(asctime)s:%(levelname)s:%(name)s: %(message)s'))
logger.addHandler(handler)


class Sejong(bridge.AutoShardedBot):
    async def on_ready(self):
        message = f"{self.user} is online on {len(self.guilds)} servers serving a total of {sum([guild.member_count for guild in self.guilds if hasattr(guild, '_member_count')])} members."
        logger.info(message)
        print(message)

    async def on_bridge_command_error(self, ctx: bridge.BridgeApplicationContext, error: discord.DiscordException):
        if isinstance(error, CommandOnCooldown):
            await ctx.respond(f"This command is currently on cooldown! Try again in {int(error.retry_after)}s.")
        elif isinstance(error, CommandNotFound):
            await ctx.respond(f"The command you've entered is not a valid command.")
        else:
            full_error = traceback.format_exception(error)
            logger.error(''.join(full_error))
            raise error  # Here we raise other errors to ensure they aren't ignored


intents = discord.Intents.default()
activity = discord.Activity(name=settings["activity"], type=discord.ActivityType.playing)

bot = Sejong(command_prefix=settings["command_prefix"], intents=intents, activity=activity)

bot.remove_command("help")
bot.load_extensions("cogs.dictionary.cog", "cogs.hanja.cog", "cogs.prometheus", "cogs.support")

bot.run(settings["token"])
