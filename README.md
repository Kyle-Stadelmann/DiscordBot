# Custom DiscordBot

Custom DiscordBot made for the private BD Discord server. This is just a fun project several teammates work on occasionally in our free time. This is currently only available to those on the server, however a deployable version for anyone to use is planned.

## How to use

`/help` lists the available commands in the current context (Discord server or DM).

![Image of help command](https://i.imgur.com/Wgq6Kcu.png)

To view the description and parameter information for a particular command, initiate a slash command by typing `/` followed by the command on a Discord server.

## Install/Self-Host

1. `git clone https://github.com/Kyle-Stadelmann/DiscordBot`
2. `cd DiscordBot`
3. `npm install`
4. Install ffmpeg onto system and set the environment variable FFMPEG_PATH to the install location.
5. `cp .env.template .env`
6. Fill out fields in `.env` file with API keys/secrets

### Start in dev environment
In the dev environment, the dev bot specified in the `.env` file (DEV_BOT_TOKEN) will be used instead of the prod one. Additionally, certain rules such as no cooldowns are set to make development smoother.

`npm run start` or `npm run dev` for hot-reload

### Start in prod environment
In the prod environment, the bot is launched in transpiled javascript to use less resources. 

1. `npm run build`
2. `npm run start-prod`

### Run Scripts

Scripts in `src/scripts` can be executed separately from the bot. These can be executed using tsx.

`npx tsx [script-name]`
