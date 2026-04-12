import { GuardFunction } from "discordx";
import { BD5_ID } from "../constants.js";

// Guard: block execution in DMs — only run in guilds.
// For @On() event handlers only. Params is the array of event args, e.g. [message].
export const GuildOnly: GuardFunction = (params, _client, next) => {
	if (params == null || params.length === 0 || params[0]?.guild == null) {
		return false;
	}
	return next();
};

// Guard: only run inside the BD5 server.
// For @On() event handlers only. Params is the array of event args, e.g. [message].
export const BD5Only: GuardFunction = (params, _client, next) => {
	if (params == null || params.length === 0) {
		return false;
	}
	// Fallback to .guild.id for types lacking a direct .guildId property (VoiceState, Presence)
	const guildId = params[0]?.guildId ?? params[0]?.guild?.id;
	if (guildId !== BD5_ID) {
		return false;
	}
	return next();
};
