import { GuardFunction } from "discordx";
import { isNullOrUndefined } from "./general.js";

// Guard function, used for events (@On) that should only execute in guilds
export const GuildOnly: GuardFunction = (p, c, next) => {
	if (isNullOrUndefined(p) || p.length === 0 || isNullOrUndefined(p[0]?.guild)) {
		return false;
	}
	return next();
};
