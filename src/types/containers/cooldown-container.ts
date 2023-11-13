import { Collection, Snowflake } from "discord.js";
import { Cooldown, createCooldown, getCooldown } from "../data-access/cooldown.js";

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

	public async isOnCooldown(personId: Snowflake, guildId: Snowflake | undefined): Promise<boolean> {
		// If person is in Guild, check guild-wide cooldown
		return guildId !== undefined && (await this.isIdOnCooldown(guildId)) ? true : this.isIdOnCooldown(personId);
	}

	public async putOnCooldown(personId: Snowflake) {
		await this.putIdOnCooldown(personId, this.cooldownTime);
	}

	public async putOnGuildCooldown(guildId: Snowflake, cooldownTime: number) {
		await this.putIdOnCooldown(guildId, cooldownTime);
	}

	public async endCooldown(personId: Snowflake) {
		await this.endCooldownById(personId);
	}

	public async endGuildCooldown(guildId: Snowflake) {
		await this.endCooldownById(guildId);
	}

	private async getCooldown(id: string): Promise<Cooldown | undefined> {
		return this.cooldowns.get(id) || (await getCooldown(id, this.cooldownName));
	}

	private async isIdOnCooldown(id: string): Promise<boolean> {
		const cd = await this.getCooldown(id);
		return cd?.date > new Date();
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

		cd.date = undefined;
		await cd.save();
	}
}
