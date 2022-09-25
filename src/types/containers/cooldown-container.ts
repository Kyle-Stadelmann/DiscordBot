import { Collection, GuildMember, User } from "discord.js";
import { Cooldown, createCooldown, getCooldown } from "../data-access/cooldown.js";

export class CooldownContainer {
	// Person id -> Cooldown
	private cooldowns = new Collection<string, Cooldown>();
	constructor(private cooldownTime: number, private cooldownName: string) {}

	public async isOnCooldown(person: GuildMember | User): Promise<boolean> {
		const cd = await this.getCooldown(person.id);
		return cd?.date > new Date();
	}

	public async putOnCooldown(person: GuildMember | User) {
		const endCooldownEpoch = new Date().valueOf() + this.cooldownTime;
		const endCooldownDate = new Date(endCooldownEpoch);

		let cd = await this.getCooldown(person.id);

		if (cd) {
			cd.date = endCooldownDate;
			await cd.save();
		} else {
			cd = await createCooldown(person.id, this.cooldownName, endCooldownDate);
			this.cooldowns.set(person.id, cd);
		}
	}

	public async endCooldown(person: GuildMember | User): Promise<void> {
		const cd = this.cooldowns.get(person.id);
		cd.date = null;
		await cd.save();
	}

	private async getCooldown(id: string): Promise<Cooldown | undefined> {
		return this.cooldowns.get(id) || (await getCooldown(id, this.cooldownName));
	}
}
