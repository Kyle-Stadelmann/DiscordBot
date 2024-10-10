import { Collection, Snowflake } from "discord.js";
import { Cooldown, createCooldown, getCooldown } from "../data-access/cooldown.js";
import { isNullOrUndefined } from "../../util/general.js";

function convertCooldownId(userId: Snowflake, guildId?: Snowflake) {
	return isNullOrUndefined(guildId) ? userId : `${guildId}-${userId}`;
}

/*
 * CooldownContainer is managed inside of the bot-container
 */
export class CooldownContainer {
	// Cooldown 'cache'
	// User/Member/Guild id -> Cooldown
	private cooldowns = new Collection<string, Cooldown>();
	constructor(
		private cooldownTime: number,
		private cooldownName: string
	) {}

	public async isOnCooldown(userId: Snowflake, guildId?: Snowflake): Promise<boolean> {
		// If person is in Guild, check guild-wide cooldown
		if (!isNullOrUndefined(guildId) && (await this.isIdOnCooldown(guildId))) {
			return true;
		}
		return this.isIdOnCooldown(userId);
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
		return this.cooldowns.get(id) || (await getCooldown(id, this.cooldownName));
	}

	private async isIdOnCooldown(id: string): Promise<boolean> {
		const cd = await this.getCooldown(id);
		if (isNullOrUndefined(cd)) return false;
		return cd.date > new Date();
	}

	private async putIdOnCooldown(id: string, cooldownTime: number) {
		const endCooldownEpoch = new Date().valueOf() + cooldownTime;
		const endCooldownDate = new Date(endCooldownEpoch);

		let cd = await this.getCooldown(id);

		if (cd) {
			cd.date = endCooldownDate;
			await cd.save();
		} else {
			cd = await createCooldown(id, this.cooldownName, endCooldownDate);
			this.cooldowns.set(id, cd);
		}
	}

	private async endCooldownById(id: string) {
		const cd = await this.getCooldown(id);
		if (!cd) return;

		await cd.delete();
		this.cooldowns.delete(id);
	}
}
