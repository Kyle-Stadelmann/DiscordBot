import { AFKPIC_JSON_LOC, COOLDOWN_JSON_LOC, DANIEL_ID } from "../../constants.js";
import { touchJSONFile } from "../../util/db_helper.js";
import { AfkPicContainer } from "./afk_pic_container.js";
import { CommandContainer } from "./command_container.js";

export class BDBot {
	// Global state
	public commandContainer = new CommandContainer();
	public afkPicContainer = new AfkPicContainer();
	public typingTimestamps = new Map<string, number>().set(DANIEL_ID, null);

	public async initContainter() {
		await this.touchDbJSONFiles();

		const cmdContainerPromise = this.commandContainer.initContainer();
		const afkPicContainerPromise = this.afkPicContainer.initContainer();

		await Promise.all([cmdContainerPromise, afkPicContainerPromise]);
	}

	// If JSON db files don't exist, create them
	private async touchDbJSONFiles() {
		const cdPromise = touchJSONFile(COOLDOWN_JSON_LOC,"{}");
		const afkpicPromise = touchJSONFile(AFKPIC_JSON_LOC,"[]");
		await Promise.all([cdPromise, afkpicPromise]);
	}
}
