import { Snowflake, TextChannel } from "discord.js";
import { GuildQueue, Player, Track } from "discord-player";
import { DefaultExtractors } from "@discord-player/extractor";
import { Client, DApplicationCommand, MetadataStorage } from "discordx";
import { ICategory } from "@discordx/utilities";
import { DANIEL_ID } from "../../constants.js";
import { AfkPicContainer } from "./afk-pic-container.js";
import { ICooldownTime } from "../cooldown-time.js";
import { CooldownContainer } from "./cooldown-container.js";
import { getCmdCooldownStr } from "../../util/index.js";

// Global state and functions that read/write global state
export class BDBot {
	// Global state
	private readonly afkPicContainer = new AfkPicContainer();
	private readonly cdContainers = new Map<string, CooldownContainer>();
	public readonly typingTimestamps = new Map<string, number>().set(DANIEL_ID, null);
	public player: Player;

	public async initContainter(client: Client) {
		const afkPicContainerPromise = this.afkPicContainer.initContainer();
		const initPlayerPromise = this.initPlayer(client);
		this.initCooldowns();

		await Promise.all([afkPicContainerPromise, initPlayerPromise]);
	}

	public hasAfkPics(): boolean {
		return this.afkPicContainer.hasPics();
	}

	// Returns [] if there are no pics
	public getRandomAfkPicUrl(shouldGetStagingPic?: boolean, count?: number): string[] {
		return this.afkPicContainer.getRandomPicUrls(shouldGetStagingPic, count);
	}

	public hasAfkPicsOfUser(userId: string): boolean {
		return this.afkPicContainer.hasUser(userId);
	}

	// Returns [] if user has no pics
	public getRandomAfkPicUrlByUser(userId: string, count?: number): string[] {
		return this.afkPicContainer.getRandomUserPicUrls(userId, count);
	}

	public async tryAddAfkPics(picUrls: string[], submitterUserId: string): Promise<boolean> {
		try {
			return await this.afkPicContainer.tryAddAfkPics(picUrls, submitterUserId);
		} catch (error) {
			console.error(error);
			return false;
		}
	}

	public isOnCooldown(cmdCooldownName: string, personId: Snowflake, guildId?: Snowflake): Promise<boolean> {
		const cdContainer = this.cdContainers.get(cmdCooldownName);
		return cdContainer.isOnCooldown(personId, guildId);
	}

	public async putOnCooldown(cmdCooldownName: string, personId: Snowflake, guildId?: Snowflake) {
		const cdContainer = this.cdContainers.get(cmdCooldownName);
		await cdContainer.putOnCooldown(personId, guildId);
	}

	public async putOnGuildWideCooldown(guildId: Snowflake, cmdCooldownName: string, cd: number) {
		const cdContainer = this.cdContainers.get(cmdCooldownName);
		await cdContainer.putOnGuildWideCooldown(guildId, cd);
	}

	public async endCooldown(cmdCooldownName: string, userId: Snowflake, guildId?: Snowflake) {
		const cdContainer = this.cdContainers.get(cmdCooldownName);
		await cdContainer.endCooldown(userId, guildId);
	}

	public async endGuildWideCooldown(guildId: Snowflake, cmdCooldownName: string) {
		const cdContainer = this.cdContainers.get(cmdCooldownName);
		await cdContainer.endGuildWideCooldown(guildId);
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

	private async initPlayer(client: Client) {
		this.player = new Player(client, {
			// ytdlOptions: {
			// 	quality: "lowestaudio",
			// 	filter: "audioonly",
			// 	// eslint-disable-next-line no-bitwise
			// 	highWaterMark: 1 << 25,
			// },
		});

		await this.player.extractors.loadMulti(DefaultExtractors);

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
