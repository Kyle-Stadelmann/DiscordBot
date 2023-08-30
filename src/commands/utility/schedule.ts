import { Discord } from "discordx";
import { Category } from "@discordx/utilities";
import { CommandCategory } from "../../types/command.js";

@Discord()
@Category(CommandCategory.Utility)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ScheduleCommand {
	// @Slash({name: "schedule", description: " "})
	async run(): Promise<boolean> {
		return true;
	}
}
