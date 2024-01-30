import logging
from logging.handlers import RotatingFileHandler

import traceback

import discord
from discord.ext import bridge
from discord.ext.commands.errors import CommandNotFound, CommandOnCooldown

from config import settings

# set up logging
logger = logging.getLogger("discord")
logger.setLevel(logging.INFO)

formatter = logging.Formatter("%(asctime)s:%(levelname)s:%(name)s: %(message)s")

fileHandler = RotatingFileHandler(
    settings["log_dir"],
    mode="a",
    maxBytes=100 * 1024 * 1024,
    backupCount=2,
    encoding=None,
    delay=False,
)
fileHandler.setFormatter(formatter)

consoleHandler = logging.StreamHandler()
consoleHandler.setFormatter(formatter)

logger.addHandler(fileHandler)
logger.addHandler(consoleHandler)


class Sejong(bridge.AutoShardedBot):
    async def on_ready(self):
        message = f"{self.user} is online on {len(self.guilds)} servers serving a total of {sum([guild.member_count for guild in self.guilds if hasattr(guild, '_member_count')])} members."
        logger.info(message)
        print(message)

    async def on_bridge_command_error(
        self, ctx: bridge.BridgeApplicationContext, error: discord.DiscordException
    ):
        if isinstance(error, CommandOnCooldown):
            await ctx.respond(
                f"This command is currently on cooldown! Try again in {int(error.retry_after)}s."
            )
        elif isinstance(error, CommandNotFound):
            await ctx.respond("The command you've entered is not a valid command.")
        else:
            # general error, log it and raise forwards
            full_error = traceback.format_exception(error)
            logger.error("".join(full_error))
            raise error


intents = discord.Intents.default()
activity = discord.Activity(
    name=settings["activity"],
    type=discord.ActivityType.playing,
)

bot = Sejong(
    command_prefix=settings["command_prefix"],
    intents=intents,
    activity=activity,
)

bot.remove_command("help")
bot.load_extensions(
    "cogs.dictionary.cog",
    "cogs.hanja.cog",
    "cogs.support",
    # "cogs.prometheus",
)

bot.run(settings["bot_token"])
