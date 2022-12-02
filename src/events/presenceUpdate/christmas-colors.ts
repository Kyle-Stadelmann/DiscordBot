import { ArgsOf, Discord, On } from "discordx";
import { HOLIDAY_GREEN_ROLE_ID, HOLIDAY_RED_ROLE_ID, HOLIDAY_WHITE_ROLE_ID } from "../../constants.js";
import { HolidayColorCycler, Month } from "../../types/holiday-color-cycler.js";

const christmasRoleIds = [
	HOLIDAY_WHITE_ROLE_ID,
	HOLIDAY_GREEN_ROLE_ID,
	HOLIDAY_RED_ROLE_ID
];

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class ChristmasColors {
    @On({event: "presenceUpdate"})
    private async updateHolidayColors([oldPresence, newPresence]: ArgsOf<"presenceUpdate">) {
		const holidayColorCycler = new HolidayColorCycler(christmasRoleIds, Month.December);
		await holidayColorCycler.tryHolidayColors(oldPresence, newPresence);
	}
}
