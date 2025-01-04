import { ArgsOf, Discord, On } from "discordx";
import { Presence } from "discord.js";
import {
	BD5_ID,
	HOLIDAY_BLACK_ROLE_ID,
	HOLIDAY_GREEN2_ROLE_ID,
	HOLIDAY_GREEN3_ROLE_ID,
	HOLIDAY_GREEN4_ROLE_ID,
	HOLIDAY_GREEN_ROLE_ID,
	HOLIDAY_ORANGE_ROLE_ID,
	HOLIDAY_RED_ROLE_ID,
	HOLIDAY_WHITE_ROLE_ID,
} from "../../constants.js";
import { client } from "../../app.js";
import { getRandomElement, isNullOrUndefined } from "../../util/index.js";

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

const holidayRoleMap = new Map([
	[Month.March, [HOLIDAY_GREEN_ROLE_ID, HOLIDAY_GREEN2_ROLE_ID, HOLIDAY_GREEN3_ROLE_ID, HOLIDAY_GREEN4_ROLE_ID]],
	[Month.October, [HOLIDAY_ORANGE_ROLE_ID, HOLIDAY_WHITE_ROLE_ID, HOLIDAY_BLACK_ROLE_ID]],
	[Month.December, [HOLIDAY_WHITE_ROLE_ID, HOLIDAY_GREEN_ROLE_ID, HOLIDAY_RED_ROLE_ID]],
]);
const allRoleIds = Array.from(new Set([...holidayRoleMap.values()].flat()));

// Assume cycler was active last time the bot was on, in case there's leftover holiday roles
let cyclerActive = true;

const lastUpdatedColorMemberMap: Map<string, Date> = new Map();

const UPDATE_DATE_PERIOD_MS = 6 * 60 * 60 * 1000;

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class HolidayColors {
	@On({ event: "presenceUpdate" })
	private async updateHolidayColors([oldPresence, newPresence]: ArgsOf<"presenceUpdate">) {
		if (!oldPresence || !newPresence) return;
		if (oldPresence.guild.id !== BD5_ID) return;

		const currDate = new Date();
		if (!holidayRoleMap.has(currDate.getMonth())) {
			if (cyclerActive) {
				// Holiday is over, perform one time global reset of holiday roles
				await this.resetAllMembersHolidayColors();
				cyclerActive = false;
			}
			return;
		}

		const holidayRoleIds = holidayRoleMap.get(currDate.getMonth());

		if (!cyclerActive) {
			// If cycler is not active, but we're in the correct month,
			// do a one time full random color cycle
			await this.giveAllMembersHolidayColors(holidayRoleIds);
			cyclerActive = true;
		}

		await this.tryUpdateMemberRole(oldPresence, newPresence, holidayRoleIds);
	}

	private async tryUpdateMemberRole(oldPresence: Presence, newPresence: Presence, holidayRoleIds: string[]) {
		// Only activate if user went from an offline->online or an online->offline state
		// meaning, either old or new presence needs to be offline, but the other can't be as well
		if (oldPresence.status === "offline" && newPresence.status !== "offline") return;

		const { member } = newPresence;
		const lastUpdatedTime = lastUpdatedColorMemberMap.get(member.id);
		if (lastUpdatedTime !== undefined && new Date().getTime() < lastUpdatedTime.getTime() + UPDATE_DATE_PERIOD_MS)
			return;

		const randomRole = getRandomElement(holidayRoleIds);
		const otherRoles = holidayRoleIds.filter((r) => r !== randomRole);

		await member.roles.remove(otherRoles);

		await member.roles.add(randomRole);
		lastUpdatedColorMemberMap.set(member.id, new Date());
	}

	private async resetAllMembersHolidayColors() {
		const promises = client.guilds.resolve(BD5_ID).members.cache.map((mem) => mem.roles.remove(allRoleIds));
		await Promise.all(promises);
	}

	private async giveAllMembersHolidayColors(holidayRoleIds: string[]) {
		const promises = client.guilds.resolve(BD5_ID).members.cache.map(async (mem) => {
			// Member already has a holiday role
			if (holidayRoleIds.some((r) => !isNullOrUndefined(mem.roles.resolve(r)))) return;
			await mem.roles.add(getRandomElement(holidayRoleIds));
		});

		await Promise.all(promises);
	}
}
