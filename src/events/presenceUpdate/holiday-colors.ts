import { ArgsOf, Discord, On } from "discordx";
import { HOLIDAY_BLACK_ROLE_ID, HOLIDAY_GREEN2_ROLE_ID, HOLIDAY_GREEN3_ROLE_ID, HOLIDAY_GREEN4_ROLE_ID, HOLIDAY_GREEN_ROLE_ID, HOLIDAY_ORANGE_ROLE_ID, HOLIDAY_RED_ROLE_ID, HOLIDAY_WHITE_ROLE_ID } from "../../constants.js";
import { HolidayColorCycler, Month } from "../../types/holiday-color-cycler.js";

const halloweenRoleIds = [
	HOLIDAY_ORANGE_ROLE_ID,
	HOLIDAY_WHITE_ROLE_ID,
	HOLIDAY_BLACK_ROLE_ID
];

const stPatricksRoleIds = [
	HOLIDAY_GREEN_ROLE_ID,
	HOLIDAY_GREEN2_ROLE_ID,
	HOLIDAY_GREEN3_ROLE_ID,
	HOLIDAY_GREEN4_ROLE_ID,
    HOLIDAY_ORANGE_ROLE_ID,
    HOLIDAY_WHITE_ROLE_ID
];

const christmasRoleIds = [
	HOLIDAY_WHITE_ROLE_ID,
	HOLIDAY_GREEN_ROLE_ID,
	HOLIDAY_RED_ROLE_ID
];

const halloweenColorCycler = new HolidayColorCycler(halloweenRoleIds, Month.October);
const stPatricksColorCycler = new HolidayColorCycler(stPatricksRoleIds, Month.March);
const christmasColorCycler = new HolidayColorCycler(christmasRoleIds, Month.December);

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class HolidayColors {
    @On({event: "presenceUpdate"})
    private async updateHolidayColors([oldPresence, newPresence]: ArgsOf<"presenceUpdate">) {
		await halloweenColorCycler.tryHolidayColors(oldPresence, newPresence);
		await stPatricksColorCycler.tryHolidayColors(oldPresence, newPresence);
		await christmasColorCycler.tryHolidayColors(oldPresence, newPresence);
	}
}
