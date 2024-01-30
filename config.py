from dynaconf import Dynaconf

settings = Dynaconf(
    envvar_prefix="SEJONG",
    settings_files=[
        "config/settings.yaml",
        "config/.secrets.yaml",
        "config/emojis.yaml",
    ],
)
