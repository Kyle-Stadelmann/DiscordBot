import { Command, CommandConfig } from "../../types/command";

const cmdConfig: CommandConfig = {
	name: "schedule",
	description: "",
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
