import { Message } from "discord.js";
import { bdbot } from "../../app.js";
import { Command, CommandCategory, CommandConfig } from "../../types/command.js";
import { sendErrorMessage, sendMessage } from "../../util/message-channel.js";

const cmdConfig: CommandConfig = {
	name: "skip",
	description: "Skips current track",
	category: CommandCategory.Music,
	usage: "skip",
};

class SkipCommand extends Command {
	public async run(msg: Message): Promise<boolean> {
		const queue = bdbot.player.queues.resolve(msg.guildId);

		if (!queue) {
			await sendErrorMessage(msg.channel, "Music command failed. Please start a queue using the `play` command first!");
			return false;
		}

		await sendMessage(msg.channel, `Skipping...`);
		return queue.node.skip();
	}
}

export default new SkipCommand(cmdConfig);
