import discord
from discord import ui
from discord.ext import bridge, commands

from config import settings


def get_base_embed(description: str):
    embed = discord.Embed(
        type="rich",
        description=description,
        color=settings["accent"],
    )

    embed.set_author(icon_url=settings["avatar"], name="Sejong (Bot)")

    return embed

class HelpView(ui.View):
    @ui.select(
        placeholder="Select a topic to get help for.",
        min_values=1,
        max_values=1,
        options=[
             discord.SelectOption(
                label="Invite",
                value="invite",
                description="How can I get Sejong on my own server?"
            ),
             discord.SelectOption(
                label="Support Server",
                value="support",
                description="Where can I ask questions and give feedback?"
            )
        ]
    )

    async def select_callback(self, select: ui.Select, interaction):
        if select.values[0] == "invite":
            await interaction.response.send_message(f"Either click the 'Add to Server' button on my profile or use <{settings['invite_link']}> to invite me to your server.", ephemeral=True)
        elif select.values[0] == "support":
            await interaction.response.send_message(f"Use {settings['support_discord']} for any questions and inquiries regarding Sejong. Feel free to mention <@!{settings['owner_id']}> :)", ephemeral=True)


class SupportCog(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @bridge.bridge_command(name="help", description="Get help for commands.")
    async def help(self, ctx):
        embed = get_base_embed("Use this menu to get help for all things related to this bot.")

        embed.add_field(name="/dictionary", value="Search the dictionary for a Korean word.\nResults come from the [NIKL Learners\' Dictionary](https://krdict.korean.go.kr/).\nUse the Korean / English buttons to swap the language of the meanings.\n__Ex. /word 나무__", inline=False)
        embed.add_field(name="/examples", value="Search the NIKL dictionary for example sentences given a Korean word.\n__Ex. /examples 나무__", inline=False)
        embed.add_field(name="/hanja", value="Search for Hanja in English, Korean, or Hanja itself.\nResults come from a local database of hanja that is unfortunately not publicly available anymore, and therefore is no longer being updated. If you find that you cannot find what you are looking for, consult online resources such as Naver dictionary.\n__Ex. /hanja 時間__", inline=False)
        embed.add_field(name="\u200B", value=f"[{settings['heart']} Made by @Marvin#1997, consider buying him a coffee!]({settings['coffeelink']})", inline=False)
        await ctx.interaction.response.send_message(view=HelpView(), embed=embed, ephemeral=True)

def setup(bot):
    bot.add_cog(SupportCog(bot))

