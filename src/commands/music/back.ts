import { Message } from "discord.js";
import { bdbot } from "../../app.js";
import { Command, CommandCategory, CommandConfig } from "../../types/command.js";
import { sendErrorMessage, sendMessage } from "../../util/message-channel.js";
import { isQueueValid } from "../../util/music-helpers.js";

const cmdConfig: CommandConfig = {
	name: "back",
	description: "Plays the previous track",
	category: CommandCategory.Music,
	usage: "back",
};

class BackCommand extends Command {
	public async run(msg: Message): Promise<boolean> {
		const queue = bdbot.player.queues.resolve(msg.guildId);

		if (!isQueueValid(queue)) {
			await sendErrorMessage(
				msg.channel,
				"Music command failed. Please start a queue using the `play` command first!"
			);
			return false;
		}

		try {
			await queue.history.previous();
		} catch (error) {
			await sendMessage(msg.channel, "Could not find previous track");
			return false;
		}

		return true;
	}
}

export default new BackCommand(cmdConfig);
