import { Snowflake } from "discord.js";
import { TTLCache } from "@isaacs/ttlcache";
import { Cooldown, createCooldown, getCooldown } from "../data-access/cooldown.js";
import { isNullOrUndefined } from "../../util/general.js";

function convertCooldownId(userId: Snowflake, guildId?: Snowflake) {
	return isNullOrUndefined(guildId) ? userId : `${guildId}-${userId}`;
}

/**
 * Manages in-memory and DynamoDB-persisted cooldowns for a single command.
 * Each instance tracks state for one unique command (identified by `cooldownName`)
 * and enforces a uniform `cooldownTime`. It functions as a write-through TTL cache:
 * hydrating from DynamoDB on misses and automatically purging expired entries
 * to maintain a bounded memory footprint.
 */
export class CooldownContainer {
	// Cooldown 'cache'
	// User/Member/Guild id -> Cooldown
	private cooldowns: TTLCache<string, Cooldown>;

	constructor(
		private cooldownTime: number,
		private cooldownName: string
	) {
		this.cooldowns = new TTLCache<string, Cooldown>({ max: 10000, ttl: cooldownTime });
	}

	public async isOnCooldown(userId: Snowflake, guildId?: Snowflake): Promise<boolean> {
		// If person is in Guild, check guild-wide cooldown
		if (!isNullOrUndefined(guildId) && (await this.isIdOnCooldown(guildId))) {
			return true;
		}
		return this.isIdOnCooldown(convertCooldownId(userId, guildId));
	}

	public async putOnCooldown(userId: Snowflake, guildId?: Snowflake) {
		await this.putIdOnCooldown(convertCooldownId(userId, guildId), this.cooldownTime);
	}

	public async putOnGuildWideCooldown(guildId: Snowflake, cooldownTime: number) {
		await this.putIdOnCooldown(guildId, cooldownTime);
	}

	public async endCooldown(userId: Snowflake, guildId?: Snowflake) {
		await this.endCooldownById(convertCooldownId(userId, guildId));
	}

	public async endGuildWideCooldown(guildId: Snowflake) {
		await this.endCooldownById(guildId);
	}

	private async getCooldown(id: string): Promise<Cooldown | undefined> {
		let cd = this.cooldowns.get(id);
		if (cd) return cd;

		cd = await getCooldown(id, this.cooldownName);
		if (cd) {
			// Hydrate the cache from the DB result to avoid redundant database reads for this active cooldown
			this.cooldowns.set(id, cd);
		}

		return cd;
	}

	private async isIdOnCooldown(id: string): Promise<boolean> {
		const cd = await this.getCooldown(id);
		if (isNullOrUndefined(cd)) return false;
		return cd.date > new Date();
	}

	private async putIdOnCooldown(id: string, cooldownTime: number) {
		const endCooldownEpoch = Date.now() + cooldownTime;
		const endCooldownDate = new Date(endCooldownEpoch);

		let cd = await this.getCooldown(id);

		if (cd) {
			cd.date = endCooldownDate;
			await cd.save();
		} else {
			cd = await createCooldown(id, this.cooldownName, endCooldownDate);
		}

		// Refresh the TTL in the cache so the entry eviction timer resets for this renewed cooldown
		this.cooldowns.set(id, cd);
	}

	private async endCooldownById(id: string) {
		const cd = await this.getCooldown(id);
		if (!cd) return;

		await cd.delete();
		this.cooldowns.delete(id);
	}
}
