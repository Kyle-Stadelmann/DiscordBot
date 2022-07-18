import { GuildMember } from "discord.js";
import { Low, JSONFile } from "lowdb";
import { COOLDOWN_JSON_LOC } from "../../constants.js";
import { Cooldown, CooldownFile } from "../../util/cooldown_helpers.js";

export class CooldownContainer {
	private cooldowns: Cooldown;
	private db: Low<CooldownFile>;

	constructor(private cooldownTime: number, private cooldownName: string) {
		const adapter = new JSONFile<CooldownFile>(COOLDOWN_JSON_LOC);
		this.db = new Low(adapter);
		this.cooldowns = {};

		// Sync execution of async function, but won't cause realistic issues here for the current scope of this bot
		// eslint-disable-next-line @typescript-eslint/no-floating-promises
		this.initCooldowns();
	}

	public isOnCooldown(member: GuildMember): boolean {
		const memberId = member.id;
		const cooldownDate = this.cooldowns[`${memberId}`];

		if (!cooldownDate) return false;

		if (cooldownDate > new Date()) return true;
		return false;
	}

	public async putOnCooldown(member: GuildMember) {
		const endCooldownEpoch = new Date().valueOf() + this.cooldownTime;
		const endCooldownDate = new Date(endCooldownEpoch);
		
		this.cooldowns[`${member.id}`] = endCooldownDate;
		// TODO: Maybe remove the await on this (doubt it will slow command handling realistically though)
		await this.updateDb();
	}

	public async endCooldown(member: GuildMember) {
		delete this.cooldowns[`${member.id}`]

		// TODO: Maybe remove the await on this (doubt it will slow command handling realistically though)
		await this.updateDb();
	}

	private async updateDb() {
		await this.db.read();

		this.db.data[`${this.cooldownName}`] = this.cooldowns;
		
		await this.db.write();
	}

	private async initCooldowns() {
		await this.db.read();
		const existingCd = this.db.data[`${this.cooldownName}`]
		this.cooldowns = existingCd ?? {};
	}
}
