import { Message } from "discord.js";
import { bdbot } from "../../app.js";
import { Command, CommandConfig } from "../../types/command.js";

const cmdConfig: CommandConfig = {
	name: "pause",
	description: "pauses the current track",
	usage: "pause",
};

class PauseCommand extends Command {
	public async run(msg: Message): Promise<boolean> {
		const queue = bdbot.player.getQueue(msg.guildId);
		
        return queue.setPaused(true);
	}
}

export default new PauseCommand(cmdConfig);
