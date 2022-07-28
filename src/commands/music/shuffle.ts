import { Message } from "discord.js";
import { bdbot } from "../../app.js";
import { Command, CommandConfig } from "../../types/command.js";

const cmdConfig: CommandConfig = {
	name: "shuffle",
	description: "shuffles the queue",
	usage: "shuffle",
};

class ShuffleCommand extends Command {
	public async run(msg: Message): Promise<boolean> {
		const queue = bdbot.player.getQueue(msg.guildId);

        return queue.shuffle();
	}
}

export default new ShuffleCommand(cmdConfig);
