import { Guild, GuildMember } from "discord.js";
import { ArgsOf, Discord, On } from "discordx";
import { BD5_ID, BOTS_ROLE_ID, GUESTS_ROLE_ID, HOLIDAY_BLACK_ROLE_ID, HOLIDAY_ORANGE_ROLE_ID, HOLIDAY_WHITE_ROLE_ID, TEMPORAL_MANTLE_ROLE_ID } from "../../constants.js";
import { rotateThroughRoles } from "../../util/holiday-role-helper.js";

const roleIdOrder = [
	HOLIDAY_ORANGE_ROLE_ID,
	HOLIDAY_WHITE_ROLE_ID,
	HOLIDAY_BLACK_ROLE_ID
];

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class HalloweenColors {
	@On({ event: "presenceUpdate" })
	private async updateHalloweenColors([oldPresence, newPresence]: ArgsOf<"presenceUpdate">) {
		if (!oldPresence || !newPresence) return;
		if (oldPresence.guild.id !== BD5_ID) return;
		// Only activate in October
		if (new Date().getMonth() !== 9) return;
		// Only activate if user went from an offline->online or an online->offline state
		// meaning, either old or new presence needs to be offline, but the other can't be as well
		if ((oldPresence.status === "offline") === (newPresence.status === "offline")) return;
		const displayOrderMemberList = this.getBd5DisplayOrderMemberList(oldPresence.guild);
		await rotateThroughRoles(displayOrderMemberList, roleIdOrder);
	}

	private getBd5DisplayOrderMemberList(guild: Guild): GuildMember[] {
		const temporalMantleMembers = this.getSortedMemberListForRole(guild, TEMPORAL_MANTLE_ROLE_ID);
		const guestsMembers = this.getSortedMemberListForRole(guild, GUESTS_ROLE_ID);
		const botsMembers = this.getSortedMemberListForRole(guild, BOTS_ROLE_ID);
		return temporalMantleMembers.concat(guestsMembers).concat(botsMembers);
	}

	private getSortedMemberListForRole(guild: Guild, roleId: string): GuildMember[] {
		const members = guild.roles.resolve(roleId)
			.members.filter(m => m.presence?.status !== "offline");
		return [...members.values()].sort((m1, m2) => m1.displayName.localeCompare(m2.displayName))
	}
}
