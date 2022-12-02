import { ArgsOf, Discord, On } from "discordx";
import { HOLIDAY_BLACK_ROLE_ID, HOLIDAY_ORANGE_ROLE_ID, HOLIDAY_WHITE_ROLE_ID } from "../../constants.js";
import { HolidayColorCycler, Month } from "../../types/holiday-color-cycler.js";

const halloweenRoleIds = [
	HOLIDAY_ORANGE_ROLE_ID,
	HOLIDAY_WHITE_ROLE_ID,
	HOLIDAY_BLACK_ROLE_ID
];

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class HalloweenColors {
    @On({event: "presenceUpdate"})
    private async updateHolidayColors([oldPresence, newPresence]: ArgsOf<"presenceUpdate">) {
		const holidayColorCycler = new HolidayColorCycler(halloweenRoleIds, Month.October);
		await holidayColorCycler.tryHolidayColors(oldPresence, newPresence);
	}
}
