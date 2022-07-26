import { MessageAttachment } from "discord.js";
import { DANIEL_ID } from "../../constants.js";
import { UserAfkPic } from "../data_access/afk_pic.js";
import { AfkPicContainer } from "./afk_pic_container.js";
import { CommandContainer } from "./command_container.js";

// Global state and functions that read/write global state
export class BDBot {
	// Global state
	public readonly commandContainer = new CommandContainer();
	private readonly afkPicContainer = new AfkPicContainer();

	public readonly typingTimestamps = new Map<string, number>().set(DANIEL_ID, null);

	public async initContainter() {
		const cmdContainerPromise = this.commandContainer.initContainer();
		const afkPicContainerPromise = this.afkPicContainer.initContainer();

		await Promise.all([cmdContainerPromise, afkPicContainerPromise]);
	}

	public hasAfkPics(): boolean {
		return this.afkPicContainer.hasPics();
	}

	// Check hasAfkPics first
	// Retrieves an afk pic from one of the afk pic containers
	public getRandomAfkPic(): UserAfkPic {
		return this.afkPicContainer.getRandomUserPicUrl();
	}

	public hasUser(userId: string): boolean {
		return this.afkPicContainer.hasUser(userId);
	}

	// Check userhasAfkPic first
	// Retrieves an afk pic from one of the afk pic containers
	public getRandomAfkPicByUser(userId: string): UserAfkPic {
		return this.afkPicContainer.getRandomUserPicUrl(userId);
	}

	public async tryAddAfkPics(attachments: MessageAttachment[], picUrls: string[]): Promise<boolean> {
		
	}
}
