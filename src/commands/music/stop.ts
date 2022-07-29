import { Message } from "discord.js";
import { bdbot } from "../../app.js";
import { Command, CommandConfig } from "../../types/command.js";

const cmdConfig: CommandConfig = {
	name: "stop",
	description: "Stops currently playing music and closes the queue",
	usage: "stop",
};

class StopCommand extends Command {
	public async run(msg: Message): Promise<boolean> {
		const queue = bdbot.player.getQueue(msg.guildId);
		if (queue) queue.destroy(true);
		return true;
	}
}

export default new StopCommand(cmdConfig);
