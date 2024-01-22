# from discord import AutoShardedClient
# from discord.ext import bridge, commands, tasks
# from prometheus_client import Counter, Gauge, start_http_server

# METRIC_PREFIX = 'discord_'

# CONNECTION_GAUGE = Gauge(
#     METRIC_PREFIX + 'connected',
#     'Determines if the bot is connected to Discord',
#     ['shard'],
# )
# LATENCY_GAUGE = Gauge(
#     METRIC_PREFIX + 'latency',
#     'latency to Discord',
#     ['shard'],
# )
# GUILD_GAUGE = Gauge(
#     METRIC_PREFIX + 'stat_total_guilds',
#     'Amount of guild this bot is a member of'
# )
# CHANNEL_GAUGE = Gauge(
#     METRIC_PREFIX + 'stat_total_channels',
#     'Amount of channels this bot is has access to'
# )
# USER_GAUGE = Gauge(
#     METRIC_PREFIX + 'stat_total_users',
#     'Amount of users this bot can see'
# )
# COMMANDS_GAUGE = Gauge(
#     METRIC_PREFIX + 'stat_total_commands',
#     'Amount of commands'
# )

# ON_COMMAND_COUNTER = Counter('discord_event_on_command', 'Amount of commands called by users', ['shard', 'command'])
# ON_COMMAND_ERROR_COUNTER = Counter('discord_event_on_application_command_error', 'Amount of errors raised during handling of commands', ['shard', 'type'])


# class PrometheusCog(commands.Cog):
#     """
#     A Cog to be added to a discord bot. The prometheus server will start once the bot is ready
#     using the `on_ready` listener.
#     """

#     def __init__(self, bot: commands.Bot, port: int=8000):
#         """
#         Parameters:
#             bot: The Discord bot
#             port: The port for the Prometheus server
#         """

#         self.bot = bot
#         self.port = port

#         self.started = False

#         # start() comes from the @task.loop decorator
#         # pylint: disable=no-member
#         self.latency_loop.start()
#         self.members_loop.start()
#         # pylint: enable=no-member

#     def init_gauges(self):
#         num_of_guilds = len(self.bot.guilds)
#         GUILD_GAUGE.set(num_of_guilds)

#         num_of_channels = len(set(self.bot.get_all_channels()))
#         CHANNEL_GAUGE.set(num_of_channels)

#         num_of_users = sum([guild.member_count for guild in self.bot.guilds if hasattr(guild, "_member_count")])
#         USER_GAUGE.set(num_of_users)

#         num_of_commands = len(self.get_all_commands())
#         COMMANDS_GAUGE.set(num_of_commands)

#     def get_all_commands(self):
#         return self.bot.commands

#     def start_prometheus(self):
#         start_http_server(self.port)
#         self.started = True

#     @tasks.loop(seconds=5)
#     async def latency_loop(self):
#         if isinstance(self.bot, AutoShardedClient):
#             for shard, latency in self.bot.latencies:
#                 LATENCY_GAUGE.labels(shard).set(latency)
#         else:
#             LATENCY_GAUGE.labels(None).set(self.bot.latency)

#     @tasks.loop(seconds=30)
#     async def members_loop(self):
#         USER_GAUGE.set(sum([guild.member_count for guild in self.bot.guilds]))

#     @commands.Cog.listener()
#     async def on_ready(self):

#         # some gauges needs to be initialized after each reconect
#         # (value could changed during an outtage)
#         self.init_gauges()

#         # Set connection back up (since we in on_ready)
#         CONNECTION_GAUGE.labels(None).set(1)

#         # on_ready can be called multiple times, this started
#         # check is to make sure the service does not start twice
#         if not self.started:
#             self.start_prometheus()

#     @commands.Cog.listener()
#     async def on_bridge_command(self, ctx: bridge.BridgeApplicationContext):
#         shard_id = ctx.guild.shard_id if ctx.guild else None
#         ON_COMMAND_COUNTER.labels(shard_id, ctx.command.name).inc()


#     @commands.Cog.listener()
#     async def on_bridge_command_error(self, ctx: bridge.BridgeApplicationContext, _):
#         shard_id = ctx.guild.shard_id if ctx.guild else None
#         ON_COMMAND_ERROR_COUNTER.labels(shard_id, ctx.command.name).inc()

#     @commands.Cog.listener()
#     async def on_connect(self):
#         CONNECTION_GAUGE.labels(None).set(1)

#     @commands.Cog.listener()
#     async def on_resumed(self):
#         CONNECTION_GAUGE.labels(None).set(1)

#     @commands.Cog.listener()
#     async def on_disconnect(self):
#         CONNECTION_GAUGE.labels(None).set(0)

#     @commands.Cog.listener()
#     async def on_shard_ready(self, shard_id):
#         CONNECTION_GAUGE.labels(shard_id).set(1)

#     @commands.Cog.listener()
#     async def on_shard_connect(self, shard_id):
#         CONNECTION_GAUGE.labels(shard_id).set(1)

#     @commands.Cog.listener()
#     async def on_shard_resumed(self, shard_id):
#         CONNECTION_GAUGE.labels(shard_id).set(1)

#     @commands.Cog.listener()
#     async def on_shard_disconnect(self, shard_id):
#         CONNECTION_GAUGE.labels(shard_id).set(0)

#     @commands.Cog.listener()
#     async def on_guild_join(self, _):
#         # The number of guilds, channels and users needs to be updated all together
#         self.init_gauges()

#     @commands.Cog.listener()
#     async def on_guild_remove(self, _):
#         # The number of guilds, channels and users needs to be updated all together
#         self.init_gauges()

#     @commands.Cog.listener()
#     async def on_guild_channel_create(self, _):
#         CHANNEL_GAUGE.inc()

#     @commands.Cog.listener()
#     async def on_guild_channel_delete(self, _):
#         CHANNEL_GAUGE.dec()


# def setup(bot):
#     bot.add_cog(PrometheusCog(bot))

