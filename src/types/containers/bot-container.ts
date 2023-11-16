import { Snowflake, TextChannel } from "discord.js";
import { GuildQueue, Player, Track } from "discord-player";
import { DApplicationCommand, MetadataStorage } from "discordx";
import { ICategory } from "@discordx/utilities";
import { DANIEL_ID } from "../../constants.js";
import { AfkPicContainer } from "./afk-pic-container.js";
import { client } from "../../app.js";
import { ICooldownTime } from "../cooldown-time.js";
import { CooldownContainer } from "./cooldown-container.js";
import { getCmdCooldownStr } from "../../util/index.js";

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

	public isOnCooldown(cmdCooldownName: string, personId: Snowflake, guildId: Snowflake | null): Promise<boolean> {
		const cdContainer = this.cdContainers.get(cmdCooldownName);
		return cdContainer.isOnCooldown(personId, guildId);
	}

	public async putOnCooldown(cmdCooldownName: string, personId: Snowflake) {
		const cdContainer = this.cdContainers.get(cmdCooldownName);
		await cdContainer.putOnCooldown(personId);
	}

	public async putOnGuildCooldown(guildId: Snowflake, cmdCooldownName: string, cd: number) {
		const cdContainer = this.cdContainers.get(cmdCooldownName);
		await cdContainer.putOnGuildCooldown(guildId, cd);
	}

	public async endCooldown(cmdCooldownName: string, personId: Snowflake) {
		const cdContainer = this.cdContainers.get(cmdCooldownName);
		await cdContainer.endCooldown(personId);
	}

	public async endGuildCooldown(guildId: Snowflake, cmdCooldownName: string) {
		const cdContainer = this.cdContainers.get(cmdCooldownName);
		await cdContainer.endGuildCooldown(guildId);
	}

	private initCooldowns() {
		MetadataStorage.instance.applicationCommandSlashesFlat.forEach(
			(cmd: DApplicationCommand & ICategory & ICooldownTime) => {
				const { name, group, subgroup } = cmd;
				const cmdCdName = getCmdCooldownStr(name, group, subgroup);
				const container = new CooldownContainer(cmd.cooldownTime ?? 0.5 * 1000, cmdCdName);
				this.cdContainers.set(cmdCdName, container);
			}
		);
	}

	private async initPlayer() {
		await this.player.extractors.loadDefault();

		this.player.events.on("playerStart", async (queue: GuildQueue<{ channel: TextChannel }>, track: Track) => {
			await queue.metadata.channel.send(`:notes: | Now playing **${track.title}**!`);
		});

		this.player.on("error", (error: Error) => {
			console.error("There was an error with the music bot...");
			console.error(error);
		});

		this.player.events.on("error", (queue: GuildQueue<{ channel: TextChannel }>, error: Error) => {
			console.error("There was an error with the music bot...");
			console.error(error);
		});

		this.player.events.on("playerError", (queue: GuildQueue<{ channel: TextChannel }>, error: Error) => {
			queue.metadata.channel.send("There was an error with the music bot...").catch(console.error);
			console.error("There was an error with the music bot...");
			console.error(error);
		});
	}
}
