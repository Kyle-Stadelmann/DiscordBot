import { Message } from "discord.js";
import { bdbot } from "../../app.js";
import { WHITE_CHECK_MARK, X_MARK } from "../../constants.js";
import { Command, CommandCategory, CommandConfig } from "../../types/command.js";
import { isNullOrUndefined } from "../../util/general.js";
import { sendMessage } from "../../util/message-channel.js";

const cmdConfig: CommandConfig = {
	name: "jump",
	description: "Fast forwards the queue to the specified index",
	category: CommandCategory.Music,
	usage: "jump",
};

class JumpCommand extends Command {
	public async run(msg: Message, args: string[]): Promise<boolean> {
		const queue = bdbot.player.queues.resolve(msg.guildId);
		if (isNullOrUndefined(queue) || queue.deleted || !queue.connection || args.length === 0 || Number.isNaN(+args[0])) return false;

		const np = queue.currentTrack;
		if (!np) {
			await msg.react(X_MARK);
			return false;
		}

		const ptlen = Math.trunc(queue.history.getSize() / 2);
		const index = +args[0];
		try {
			queue.node.skipTo(queue.node.getTrackPosition(index - ptlen - 2));
		} catch (error) {
			await sendMessage(msg.channel, `Jump failed, double check provided index`);
			return false;
		}

		await msg.react(WHITE_CHECK_MARK);
		return true;
	}
}

export default new JumpCommand(cmdConfig);
