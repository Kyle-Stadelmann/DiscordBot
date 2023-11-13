import { Snowflake, TextChannel } from "discord.js";
import { GuildQueue, Player, Track } from "discord-player";
import { DApplicationCommand, DSimpleCommand, MetadataStorage } from "discordx";
import { ICategory } from "@discordx/utilities";
import { DANIEL_ID } from "../../constants.js";
import { AfkPicContainer } from "./afk-pic-container.js";
import { client } from "../../app.js";
import { ICooldownTime } from "../cooldown-time.js";
import { CooldownContainer } from "./cooldown-container.js";

// Global state and functions that read/write global state
export class BDBot {
	// Global state
	private readonly afkPicContainer = new AfkPicContainer();
	private readonly cdContainers = new Map<string, CooldownContainer>();
	public readonly typingTimestamps = new Map<string, number>().set(DANIEL_ID, null);
	public readonly player = new Player(client, {
		ytdlOptions: {
			quality: "lowestaudio",
			filter: "audioonly",
			// eslint-disable-next-line no-bitwise
			highWaterMark: 1 << 25,
		},
	});

	public async initContainter() {
		const afkPicContainerPromise = this.afkPicContainer.initContainer();
		const initPlayerPromise = this.initPlayer();
		this.initCooldowns();
		
		await Promise.all([afkPicContainerPromise, initPlayerPromise]);
	}

	public hasAfkPics(): boolean {
		return this.afkPicContainer.hasPics();
	}

	// Can return undefined if there are no pics. Can use hasAfkPics first
	public getRandomAfkPicUrl(): string | undefined {
		return this.afkPicContainer.getRandomPicUrl();
	}

	public hasAfkPicsOfUser(userId: string): boolean {
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

	public isOnCooldown(cmdName: string, personId: Snowflake, guildId: Snowflake | undefined): Promise<boolean> {
		const cdContainer = this.cdContainers.get(cmdName);
		return cdContainer.isOnCooldown(personId, guildId);
	}

	public async putOnCooldown(cmdName: string, personId: Snowflake) {
		const cdContainer = this.cdContainers.get(cmdName);
		await cdContainer.putOnCooldown(personId);
	}

	public async putOnGuildCooldown(guildId: Snowflake, cmdName: string, cd: number) {
		const cdContainer = this.cdContainers.get(cmdName);
		await cdContainer.putOnGuildCooldown(guildId, cd);
	}
	
	public async endCooldown(cmdName: string, personId: Snowflake) {
		const cdContainer = this.cdContainers.get(cmdName);
		await cdContainer.endCooldown(personId);
	}

	public async endGuildCooldown(guildId: Snowflake, cmdName: string) {
		const cdContainer = this.cdContainers.get(cmdName);
		await cdContainer.endGuildCooldown(guildId);
	}

	private initCooldowns() {
		MetadataStorage.instance.applicationCommands.forEach(
			(cmd: (DApplicationCommand | DSimpleCommand) & ICategory & ICooldownTime) => {
				const container = new CooldownContainer(cmd.cooldownTime ?? 0.5 * 1000, cmd.name);
				this.cdContainers.set(cmd.name, container);
			}
		);
	}

	private async initPlayer() {
		await this.player.extractors.loadDefault();

		this.player.events.on("playerStart", async (queue: GuildQueue<{ channel: TextChannel }>, track: Track) => {
			await queue.metadata.channel.send(`:notes: | Now playing **${track.title}**!`);
		});
	}
}
