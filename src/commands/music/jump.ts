import { Message } from "discord.js";
import { bdbot } from "../../app.js";
import { WHITE_CHECK_MARK, X_MARK } from "../../constants.js";
import { Command, CommandCategory, CommandConfig } from "../../types/command.js";
import { sendErrorMessage, sendMessage } from "../../util/message-channel.js";
import { isQueueValid } from "../../util/music-helpers.js";

const cmdConfig: CommandConfig = {
	name: "jump",
	description: "Fast forwards the queue to the specified index",
	category: CommandCategory.Music,
	usage: "jump",
};

class JumpCommand extends Command {
	public async run(msg: Message, args: string[]): Promise<boolean> {
		const queue = bdbot.player.queues.resolve(msg.guildId);
		if (!isQueueValid(queue) || args.length === 0) {
			await sendErrorMessage(msg.channel, "Music command failed. Please start a queue using the `play` command first, or check command arguments!");
			return false;
		}

		const index = +args[0];
		if (Number.isNaN(index)) {
			await sendErrorMessage(msg.channel, "Jump failed, double check provided index.")
			return false;
		}

		const np = queue.currentTrack;
		if (!np) {
			await msg.react(X_MARK);
			return false;
		}

		const ptlen = queue.history.size;
		try {
			queue.node.skipTo(queue.node.getTrackPosition(index - ptlen - 2));
		} catch (error) {
			await sendMessage(msg.channel, `Jump failed, double check provided index.`);
			return false;
		}

		await msg.react(WHITE_CHECK_MARK);
		return true;
	}
}

export default new JumpCommand(cmdConfig);
