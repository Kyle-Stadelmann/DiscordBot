import { GuildMember } from "discord.js";
import { Low, JSONFile } from "lowdb";
import { COOLDOWN_JSON_LOC } from "../../constants.js";
import { Cooldown, CooldownFile } from "../cooldown.js";

export class CooldownContainer {
	private cooldowns: Cooldown;
	private db: Low<CooldownFile>;

	constructor(private cooldownTime: number, private cooldownName: string) {
		const adapter = new JSONFile<CooldownFile>(COOLDOWN_JSON_LOC);
		this.db = new Low(adapter);
		this.cooldowns = {};
	}

	public async initContainer() {
		await this.db.read();
		const existingCd = this.getDbBufferCooldown();
		this.cooldowns = existingCd ?? {};
	}

	public isOnCooldown(member: GuildMember): boolean {
		const cooldownDate = this.getCooldownDate(member);

		if (!cooldownDate) return false;

		if (cooldownDate > new Date()) return true;
		return false;
	}

	public async putOnCooldown(member: GuildMember) {
		const endCooldownEpoch = new Date().valueOf() + this.cooldownTime;
		const endCooldownDate = new Date(endCooldownEpoch);

		this.setCooldownDate(member, endCooldownDate);
		await this.updateDb();
	}

	public async endCooldown(member: GuildMember) {
		delete this.cooldowns[`${member.id}`];

		await this.updateDb();
	}

	private async updateDb() {
		await this.db.read();

		this.setDbBufferCooldown(this.cooldowns);

		await this.db.write();
	}

	private getCooldownDate(member: GuildMember): Date {
		return this.cooldowns[`${member.id}`];
	}

	private setCooldownDate(member: GuildMember, date: Date) {
		this.cooldowns[`${member.id}`] = date;
	}

	private getDbBufferCooldown(): Cooldown {
		return this.db.data[`${this.cooldownName}`];
	}

	private setDbBufferCooldown(cd: Cooldown) {
		this.db.data[`${this.cooldownName}`] = cd;
	}
}
