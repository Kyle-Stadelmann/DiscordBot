import { GuildMember, Presence } from "discord.js";
import { BD5_ID } from "../constants.js";

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

export class HolidayColorCycler {
    constructor(private holidayColorRoleIds: string[], private month: Month) {}

    public async tryHolidayColors(oldPresence: Presence, newPresence: Presence) {
        if (!oldPresence || !newPresence) return;
		if (oldPresence.guild.id !== BD5_ID) return;
        // Only activate in the correct month
		if (new Date().getMonth() !== this.month) return;
		// Only activate if user went from an offline->online or an online->offline state
		// meaning, either old or new presence needs to be offline, but the other can't be as well
		if ((oldPresence.status === "offline") && (newPresence.status !== "offline")) return;
		
        const { member } = newPresence;
		const randomRole = this.getRandomHolidayRole();
		const otherRoles = this.holidayColorRoleIds.filter(r => r !== randomRole);

        await this.removeHolidayColorRoles(member, otherRoles);

		await member.roles.add(randomRole);
    }

    private getRandomHolidayRole(): string {
		const randomRoleIndex = Math.floor(Math.random()*this.holidayColorRoleIds.length);
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
}