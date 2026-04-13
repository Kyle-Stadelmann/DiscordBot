import { CommandInteraction, Message, Presence, VoiceState } from "discord.js";
import { GuardFunction } from "discordx";
import { BD5_ID } from "../constants.js";

type CommonDiscordObject = Message | CommandInteraction | VoiceState | Presence;

// Guard: block execution in DMs — only run in guilds.
// For @On() event handlers only. Params is the array of event args, e.g. [message].
export const GuildOnly: GuardFunction = (params, _client, next) => {
	const args = params as CommonDiscordObject[];
	const arg = args[0];
	if (arg?.guild == null) {
		return false;
	}
	return next();
};

// Guard: only run inside the BD5 server.
// For @On() event handlers only. Params is the array of event args, e.g. [message].
export const BD5Only: GuardFunction = (params, _client, next) => {
	const args = params as CommonDiscordObject[];
	const arg = args[0];
	if (arg == null) {
		return false;
	}
	// Fallback to .guild.id for types lacking a direct .guildId property (VoiceState, Presence)
	const guildId = "guildId" in arg ? arg.guildId : arg.guild?.id;
	if (guildId !== BD5_ID) {
		return false;
	}
	return next();
};
