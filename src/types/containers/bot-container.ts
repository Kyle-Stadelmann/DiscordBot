import { Collection, Message, TextChannel } from "discord.js";
import { GuildQueue, Player, Track } from "discord-player";
import { DANIEL_ID } from "../../constants.js";
import { Command, CommandCategory } from "../command.js";
import { AfkPicContainer } from "./afk-pic-container.js";
import { CommandContainer } from "./command-container.js";
import { client } from "../../app.js";

// Global state and functions that read/write global state
export class BDBot {
	// Global state
	private readonly commandContainer = new CommandContainer();
	private readonly afkPicContainer = new AfkPicContainer();
	public readonly typingTimestamps = new Map<string, number>().set(DANIEL_ID, null);
	public readonly player = new Player(client);

	public async initContainter() {
		const cmdContainerPromise = this.commandContainer.initContainer();
		const afkPicContainerPromise = this.afkPicContainer.initContainer();
		const initPlayerPromise = this.initPlayer();

		await Promise.all([cmdContainerPromise, afkPicContainerPromise, initPlayerPromise]);
	}

	public hasAfkPics(): boolean {
		return this.afkPicContainer.hasPics();
	}

	// Can return undefined if there are no pics. Can use hasAfkPics first
	public getRandomAfkPicUrl(): string | undefined {
		return this.afkPicContainer.getRandomPicUrl();
	}

	public hasUser(userId: string): boolean {
		return this.afkPicContainer.hasUser(userId);
	}

	// Can return undefined if there are no pics for this user. Can use hasUser first
	public getRandomAfkPicUrlByUser(userId: string): string | undefined {
		return this.afkPicContainer.getRandomUserPicUrl(userId);
	}

	public async tryAddAfkPics(picUrls: string[], submitterUserId: string): Promise<boolean> {
		try {
			return await this.afkPicContainer.tryAddAfkPics(picUrls, submitterUserId);
		} catch (error) {
			console.error(error);
			return false;
		}
	}

	public tryRunCommand(cmdStr: string, msg: Message, args: string[]): Promise<boolean> {
		return this.commandContainer.tryRunCommand(cmdStr, msg, args);
	}

	public getCmdCategoryMap(): Collection<CommandCategory, Command[]> {
		return this.commandContainer.getCmdCategoryMap();
	}

	private async initPlayer() {
		await this.player.extractors.loadDefault();
		
		this.player.events.on("playerStart", async (queue: GuildQueue<{ channel: TextChannel }>, track: Track) => {
			await queue.metadata.channel.send(`:notes: | Now playing **${track.title}**!`)
		});
	}
}
