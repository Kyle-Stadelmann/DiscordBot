import { CommandInteraction, Message, Presence, VoiceState } from "discord.js";
import { GuardFunction } from "discordx";
import { BD5_ID } from "../constants.js";

type CommonDiscordObject = Message | CommandInteraction | VoiceState | Presence;

// Guard: block execution in DMs — only run in guilds.
// For @On() event handlers only. Params is the array of event args, e.g. [message].
export const GuildOnly: GuardFunction<CommonDiscordObject[]> = (params, _client, next) => {
	const arg = params[0];
	if (arg?.guild == null) {
		return false;
	}
	return next();
};

// Guard: only run inside the BD5 server.
// For @On() event handlers only. Params is the array of event args, e.g. [message].
export const BD5Only: GuardFunction<CommonDiscordObject[]> = (params, _client, next) => {
	const arg = params[0];
	if (arg == null) {
		return false;
	}
	// Use .guildId if available (Message, Interaction), fallback to .guild.id (VoiceState, Presence)
	const guildId = "guildId" in arg ? arg.guildId : arg.guild?.id;
	if (guildId !== BD5_ID) {
		return false;
	}
	return next();
};
