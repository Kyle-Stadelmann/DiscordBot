import { GuildMember, Presence } from "discord.js";
import { BD5_ID } from "../constants.js";
import { client } from "../app.js";
import { sleep } from "../util/sleep.js";

export enum Month {
	January = 0,
	February = 1,
	March = 2,
	April = 3,
	May = 4,
	June = 5,
	July = 6,
	August = 7,
	September = 8,
	October = 9,
	November = 10,
	December = 11,
}

const lastUpdatedColorMemberMap: Map<string, Date> = new Map();

const UPDATE_DATE_PERIOD_MS = 6 * 60 * 60 * 1000;

export class HolidayColorCycler {
	private cyclerActive: boolean = false;
	constructor(
		private holidayColorRoleIds: string[],
		private month: Month
	) {}

	public async tryHolidayColors(oldPresence: Presence, newPresence: Presence) {
		if (!oldPresence || !newPresence) return;
		if (oldPresence.guild.id !== BD5_ID) return;
		const currDate = new Date();
		const { member } = newPresence;

		// Only activate in the correct month
		if (currDate.getMonth() !== this.month) {
			// If cycler active is on but we are in the next month, 
			// do a one time full reset of colors for all guild members
			if (this.cyclerActive) await this.resetAllMembersHolidayColors();
			this.cyclerActive = false;
			return;
		} 
		this.cyclerActive = true;

		const lastUpdatedTime = lastUpdatedColorMemberMap.get(member.id);
		if (lastUpdatedTime !== undefined && currDate.getTime() < lastUpdatedTime.getTime() + UPDATE_DATE_PERIOD_MS)
			return;

		// Only activate if user went from an offline->online or an online->offline state
		// meaning, either old or new presence needs to be offline, but the other can't be as well
		if (oldPresence.status === "offline" && newPresence.status !== "offline") return;

		const randomRole = this.getRandomHolidayRole();
		const otherRoles = this.holidayColorRoleIds.filter((r) => r !== randomRole);

		await this.removeHolidayColorRoles(member, otherRoles);

		await member.roles.add(randomRole);
		lastUpdatedColorMemberMap.set(member.id, new Date());
	}

	private getRandomHolidayRole(): string {
		const randomRoleIndex = Math.floor(Math.random() * this.holidayColorRoleIds.length);
		return this.holidayColorRoleIds[randomRoleIndex];
	}

	private async removeHolidayColorRoles(member: GuildMember, roleIds: string[]) {
		const removePromises: Promise<GuildMember>[] = [];
		for (const r of roleIds) {
			if (member.roles.resolve(r)) {
				removePromises.push(member.roles.remove(r));
			}
		}
		await Promise.all(removePromises);
	}

	private async resetAllMembersHolidayColors() {
		// Reset all member's colors once
		const promises = client.guilds.resolve(BD5_ID).members.cache.map(async (mem) => {
			await this.removeHolidayColorRoles(mem, this.holidayColorRoleIds);
			await sleep(5000);
		});

		await Promise.all(promises);
	}
}
