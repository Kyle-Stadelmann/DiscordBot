import { ArgsOf, Discord, On } from "discordx";
import { DANIEL_ID, JUSTIN_M_ID, PROJECT_DIR } from "../../constants.js";
import { tryPlayPersonTheme } from "../../util/person-theme-helpers.js";

const JUSTIN_THEME_CHANCE = 1;
const TOXIC_THEME_CHANCE = 1;

export const GHOST_TRAIN_ROBBERY_FILE_PATH = `${PROJECT_DIR}/audio/ghost-train-robbery.mp3`;
export const TOXIC_FILE_PATH = `${PROJECT_DIR}/audio/toxic.mp3`;

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class PeopleThemes {
	@On({ event: "voiceStateUpdate" })
	private async tryPlayThemes([oldState, newState]: ArgsOf<"voiceStateUpdate">) {
		await tryPlayPersonTheme(
			JUSTIN_M_ID,
			JUSTIN_THEME_CHANCE,
			GHOST_TRAIN_ROBBERY_FILE_PATH,
			oldState,
			newState,
			Math.floor(Math.random() * 43060)
		);
		await tryPlayPersonTheme(DANIEL_ID, TOXIC_THEME_CHANCE, TOXIC_FILE_PATH, oldState, newState);
	}
}
