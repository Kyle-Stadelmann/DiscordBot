import { Message, TextChannel } from "discord.js";
import { Player, Queue, Track } from "discord-player";
import { DANIEL_ID } from "../../constants.js";
import { Command } from "../command.js";
import { AfkPicContainer } from "./afk_pic_container.js";
import { CommandContainer } from "./command_container.js";
import { bdbot, client } from "../../app.js";

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
		bdbot.player.on("trackStart", (queue: Queue<{ channel: TextChannel }>, 
			track: Track) => queue.metadata.channel.send(
			`:notes: | Now playing **${track.title}**!`));

		await Promise.all([cmdContainerPromise, afkPicContainerPromise]);
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

	// Returns all unique commands (this.commandContainer.commands)
	public getAllCommands(): Command[] {
		const cmds = this.commandContainer.commands.values();
		return [...new Set(cmds)];
	}
}
