import { Collection, GuildMember, Snowflake, User } from "discord.js";
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

	public async isOnCooldown(person: GuildMember | User): Promise<boolean> {
		// If person is in Guild, check guild-wide cooldown
		return person instanceof GuildMember && (await this.isIdOnCooldown(person.guild.id))
			? true
			: this.isIdOnCooldown(person.id);
	}

	public async putOnCooldown(person: GuildMember | User) {
		await this.putIdOnCooldown(person.id, this.cooldownTime);
	}

	public async putOnGuildCooldown(guildId: Snowflake, cooldownTime: number) {
		await this.putIdOnCooldown(guildId, cooldownTime);
	}

	public async endCooldown(person: GuildMember | User) {
		await this.endCooldownById(person.id);
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
