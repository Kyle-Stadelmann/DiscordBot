import { Message } from "discord.js";
import { bdbot } from "../../app.js";
import { Command, CommandCategory, CommandConfig } from "../../types/command.js";

const cmdConfig: CommandConfig = {
	name: "stop",
	description: "Stops currently playing music and closes the queue",
	category: CommandCategory.Music,
	usage: "stop",
};

class StopCommand extends Command {
	public async run(msg: Message): Promise<boolean> {
		const queue = bdbot.player.queues.resolve(msg.guildId);
		if (queue) queue.delete();
		return true;
	}
}

export default new StopCommand(cmdConfig);
