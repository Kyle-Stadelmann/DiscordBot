import { Message } from "discord.js";
import { bdbot } from "../../app.js";
import { Command, CommandCategory, CommandConfig } from "../../types/command.js";

const cmdConfig: CommandConfig = {
	name: "pause",
	description: "Pauses the current track",
	category: CommandCategory.Music,
	usage: "pause",
};

class PauseCommand extends Command {
	public async run(msg: Message): Promise<boolean> {
		const queue = bdbot.player.queues.resolve(msg.guildId);

		return queue.node.setPaused(true);
	}
}

export default new PauseCommand(cmdConfig);
