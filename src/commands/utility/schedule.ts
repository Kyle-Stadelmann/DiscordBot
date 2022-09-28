import { CommandConfig, Command, CommandCategory } from "../../types/command.js";

const cmdConfig: CommandConfig = {
	name: "schedule",
	description: "",
	category: CommandCategory.Utility,
	usage: `schedule`,
	allowInDM: true,
	disabled: true,
};

class ScheduleCommand extends Command {
	public async run(): Promise<boolean> {
		return true;
	}
}

export default new ScheduleCommand(cmdConfig);
