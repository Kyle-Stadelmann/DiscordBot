import { ArgsOf, Discord, On } from "discordx";
import { ASIAN_KYLE_ID, DANIEL_ID, GHOST_TRAIN_ROBBERY, JUSTIN_M_ID, L_THEME_URL, TOXIC_URL } from "../../constants.js";
import { tryPlayPersonTheme } from "../../util/person-theme-helpers.js";

const KYLE_THEME_CHANCE = 5;
const JUSTIN_THEME_CHANCE = 5;
const TOXIC_THEME_CHANCE = 5;

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class PeopleThemes {
	@On({ event: "voiceStateUpdate" })
	private async tryPlayThemes([oldState, newState]: ArgsOf<"voiceStateUpdate">) {
		await tryPlayPersonTheme(ASIAN_KYLE_ID, KYLE_THEME_CHANCE, L_THEME_URL, oldState, newState);
		await tryPlayPersonTheme(JUSTIN_M_ID, JUSTIN_THEME_CHANCE, GHOST_TRAIN_ROBBERY, oldState, newState);
		await tryPlayPersonTheme(DANIEL_ID, TOXIC_THEME_CHANCE, TOXIC_URL, oldState, newState, 68400);
	}
}
