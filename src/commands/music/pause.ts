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
		const queue = bdbot.player.getQueue(msg.guildId);

		return queue.setPaused(true);
	}
}

export default new PauseCommand(cmdConfig);
