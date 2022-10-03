import { GuildMember } from "discord.js";
import { ArgsOf, Discord, On } from "discordx";
import { BD5_ID, HOLIDAY_BLACK_ROLE_ID, HOLIDAY_ORANGE_ROLE_ID, HOLIDAY_WHITE_ROLE_ID } from "../../constants.js";

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class HalloweenColors {
	private halloweenRoleIds = [
		HOLIDAY_ORANGE_ROLE_ID,
		HOLIDAY_WHITE_ROLE_ID,
		HOLIDAY_BLACK_ROLE_ID
	];

	@On({ event: "presenceUpdate" })
	private async updateHalloweenColors([oldPresence, newPresence]: ArgsOf<"presenceUpdate">) {
		if (!oldPresence || !newPresence) return;
		if (oldPresence.guild.id !== BD5_ID) return;
		// Only activate in October
		if (new Date().getMonth() !== 9) return;
		// Only activate if user went from an offline->online or an online->offline state
		// meaning, either old or new presence needs to be offline, but the other can't be as well
		if ((oldPresence.status === "offline") && (newPresence.status !== "offline")) return;
		
		const randomRole = this.getRandomHallowenRole();
		const otherRoles = this.halloweenRoleIds.filter(r => r !== randomRole);
		await this.addAndRemoveRoles(randomRole, newPresence.member, otherRoles);
	}

	private getRandomHallowenRole(): string {
		const randomRoleIndex = Math.floor(Math.random()*this.halloweenRoleIds.length);
		return this.halloweenRoleIds[randomRoleIndex];
	}

	private async addAndRemoveRoles(newRole: string, member: GuildMember, roleIds: string[]) {
		await Promise.all([this.removeRoles(member, roleIds), member.roles.add(newRole)]);
	}

	private async removeRoles(member: GuildMember, roleIds: string[]) {
		const removePromises: Promise<GuildMember>[] = [];
		for (const r of roleIds) {
			if (member.roles.resolve(r)) {
				removePromises.push(member.roles.remove(r));
			}
		}
		await Promise.all(removePromises);
	}
}
