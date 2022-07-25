import { AFKPIC_FG_LOC, AFKPIC_JSON_LOC, COOLDOWN_JSON_LOC, DANIEL_ID, STAGING_AFKPIC_FG_LOC, STAGING_AFKPIC_JSON_LOC } from "../../constants.js";
import { getRandomElement } from "../../util/random.js";
import { AfkPic } from "../data_access/afk_pic.js";
import { AfkPicContainer } from "./afk_pic_container.js";
import { CommandContainer } from "./command_container.js";

// Global state and functions that read/write global state
export class BDBot {
	// Global state
	public readonly commandContainer = new CommandContainer();
	private readonly afkPicContainer = new AfkPicContainer();
	// Newly added pictures will go in here, will be confirmed later and added to afk pic collection
	private readonly stagingAfkPicContainer = new AfkPicContainer();

	public readonly typingTimestamps = new Map<string, number>().set(DANIEL_ID, null);

	public async initContainter() {
		await this.touchDbJSONFiles();

		const cmdContainerPromise = this.commandContainer.initContainer();
		const afkPicContainerPromise = this.afkPicContainer.initContainer();
		const stagingAfkPicContainerPromise = this.stagingAfkPicContainer.initContainer();

		await Promise.all([cmdContainerPromise, afkPicContainerPromise, stagingAfkPicContainerPromise]);
	}

	public hasAfkPics(): boolean {
		return this.afkPicContainer.hasPics() || this.stagingAfkPicContainer.hasPics();
	}

	// Check hasAfkPics first
	// Retrieves an afk pic from one of the afk pic containers
	public getRandomAfkPic(): AfkPic {
		const allPics = this.afkPicContainer.getAllPics();
		const allStagingPics = this.stagingAfkPicContainer.getAllPics();

		return getRandomElement(allPics.concat(allStagingPics));
	}

	public userHasAfkPic(userId: string): boolean {
		return this.stagingAfkPicContainer.hasUser(userId) || this.afkPicContainer.hasUser(userId);
	}

	// Check userhasAfkPic first
	// Retrieves an afk pic from one of the afk pic containers
	public getRandomAfkPicByUser(userId: string): AfkPic {
		const userPics = this.afkPicContainer.getUserPics(userId);
		const stagingUserPics = this.stagingAfkPicContainer.getUserPics(userId);

		return getRandomElement(userPics.concat(stagingUserPics));
	}

	public async tryAddAfkPics(picUrls: string[]): Promise<boolean> {
		// Check if pic url already exists in one
		if (picUrls.some(picUrl => this.afkPicContainer.doesPicAlreadyExist(picUrl) 
			|| this.stagingAfkPicContainer.doesPicAlreadyExist(picUrl))) {
			return false;
		}
		// TODO
		return false;
	}

	// If JSON db files don't exist, create them
	private async touchDbJSONFiles() {
		const cdPromise = touchJSONFile(COOLDOWN_JSON_LOC,"{}");
		const afkpicPromise = touchJSONFile(AFKPIC_JSON_LOC,"[]");
		await Promise.all([cdPromise, afkpicPromise]);
	}
}
