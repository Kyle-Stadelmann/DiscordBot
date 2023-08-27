import { Message } from "discord.js";
import { bdbot } from "../../app.js";
import { WHITE_CHECK_MARK, X_MARK } from "../../constants.js";
import { Command, CommandCategory, CommandConfig } from "../../types/command.js";
import { sendErrorMessage, sendMessage } from "../../util/message-channel.js";

const cmdConfig: CommandConfig = {
	name: "raise",
	description: "Moves specified track number to front of queue",
	category: CommandCategory.Music,
	usage: "raise",
};

// TODO: Not sure if this should stay a separate command from query
// could get messy if you try to combine
class RaiseCommand extends Command {
	public async run(msg: Message, args: string[]): Promise<boolean> {
		const queue = bdbot.player.queues.resolve(msg.guildId);
		if (!queue || queue.deleted || !queue.connection) {
			await sendErrorMessage(msg.channel, "Music command failed. Please start a queue using the `play` command first!");
			return false;
		}

		const np = queue.currentTrack;
		if (!np || !args[0]) {
			await msg.react(X_MARK);
			return false;
		}

		const ptlen = Math.trunc(queue.history.size / 2);
		try {
			const index = parseInt(args[0], 10);
			queue.moveTrack(queue.tracks[index - ptlen - 2], 0);
		} catch (error) {
			await sendMessage(msg.channel, `Raise failed, double check provided index`);
			return false;
		}

		await msg.react(WHITE_CHECK_MARK);
		return true;
	}
}

export default new RaiseCommand(cmdConfig);
