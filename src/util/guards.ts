import { GuardFunction } from "discordx";
import { BD5_ID } from "../constants.js";
import { isNullOrUndefined } from "./general.js";

// Resolves guildId from either an event args array (@On) or a direct interaction object (@Slash).
// Falls back to .guild.id for types that lack a .guildId shorthand (e.g. VoiceState, Presence).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractGuildId(params: unknown): string | null | undefined {
	const target: any = Array.isArray(params) ? params[0] : params;
	return target?.guildId ?? target?.guild?.id;
}

// Guard: block execution in DMs — only run in guilds.
// For @On() event handlers only. Params is the array of event args, e.g. [message].
export const GuildOnly: GuardFunction = (params, _client, next) => {
	if (isNullOrUndefined(params) || params.length === 0 || isNullOrUndefined(params[0]?.guild)) {
		return false;
	}
	return next();
};

// Guard: only run inside the BD5 server.
// Works with @On() event handlers and @Slash() / @ContextMenu() commands.
// For @On(), params is the array of event args (e.g. [message], [oldState, newState]).
// For @Slash() / @ContextMenu(), params is the interaction object directly.
export const BD5Only: GuardFunction = (params, _client, next) => {
	if (extractGuildId(params) !== BD5_ID) return false;
	return next();
};
