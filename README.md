# Custom DiscordBot

Custom DiscordBot made for the private BD Discord server. This is just a fun project several teammates work on occasionally in our free time. This is currently only available to those on the server, however a deployable version for anyone to use is planned.

## How to use

`/help` lists the available commands in the current context (Discord server or DM).

![Image of help command](https://i.imgur.com/Wgq6Kcu.png)

To view the description and parameter information for a particular command, initiate a slash command by typing `/` followed by the command on a Discord server.

## Install/Self-Host

1. `git clone https://github.com/Kyle-Stadelmann/DiscordBot`
2. `cd DiscordBot`
3. Install ffmpeg onto system and set the environment variable FFMPEG_PATH to the install location.
4. `npm install`
5. `npm run start`

### Run Scripts

Scripts in `src/scripts` can be executed separately from the bot. These can be executed using tsx.

`npx tsx [script-name]`
