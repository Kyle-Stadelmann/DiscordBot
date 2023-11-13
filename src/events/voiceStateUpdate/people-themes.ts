import { ArgsOf, Discord, On } from "discordx";
import { GHOST_TRAIN_ROBBERY, JUSTIN_M_ID } from "../../constants.js";
import { tryPlayPersonTheme } from "../../util/person-theme-helpers.js";

const JUSTIN_THEME_CHANCE = 5;

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class PeopleThemes {
	@On({ event: "voiceStateUpdate" })
	private async tryPlayThemes([oldState, newState]: ArgsOf<"voiceStateUpdate">) {
		await tryPlayPersonTheme(JUSTIN_M_ID, JUSTIN_THEME_CHANCE, GHOST_TRAIN_ROBBERY, oldState, newState);
	}
}
