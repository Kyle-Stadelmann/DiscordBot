import { GuildMember, Snowflake } from "discord.js";
import { Low, JSONFile } from "lowdb";
import { COOLDOWN_JSON_LOC } from "../../constants";

export class CooldownContainer {
	private cooldowns: Map<Snowflake, Date> = new Map();
	private db: Low;

	constructor(private cooldownTime: number, private cooldownName: string) {
		const adapter = new JSONFile(COOLDOWN_JSON_LOC);
		this.db = new Low(adapter);

		// Sync execution of async function, but won't cause realistic issues here for the current scope of this bot
		// eslint-disable-next-line @typescript-eslint/no-floating-promises
		this.initCooldowns();
	}

	public isOnCooldown(member: GuildMember): boolean {
		const memberId = member.id;

		if (!this.cooldowns.has(memberId)) return false;

		const endCooldownTime = this.cooldowns.get(memberId);
		if (endCooldownTime > new Date()) return true;
		return false;
	}

	public async putOnCooldown(member: GuildMember) {
		const endCooldownEpoch = new Date().valueOf() + this.cooldownTime;
		const endCooldownDate = new Date(endCooldownEpoch);

		this.cooldowns.set(member.id, endCooldownDate);

		// TODO: Maybe remove the await on this (doubt it will slow command handling realistically though)
		await this.updateDb();
	}

	public async endCooldown(member: GuildMember) {
		this.cooldowns.delete(member.id);

		// TODO: Maybe remove the await on this (doubt it will slow command handling realistically though)
		await this.updateDb();
	}

	private async updateDb() {
		await this.db.read();

		// Produces { commandName: cooldowns }
		this.db.data[this.cooldownName] = this.cooldowns;

		await this.db.write();
	}

	private async initCooldowns() {
		await this.db.read();

		this.cooldowns = this.db.data[`${this.cooldownName}`] as Map<Snowflake, Date>;
	}
}
