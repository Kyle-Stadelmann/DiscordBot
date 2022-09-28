import { Message } from "discord.js";
import { bdbot } from "../../app.js";
import { WHITE_CHECK_MARK, X_MARK } from "../../constants.js";
import { Command, CommandCategory, CommandConfig } from "../../types/command.js";
import { sendMessage } from "../../util/message-channel.js";

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
		const queue = bdbot.player.getQueue(msg.guildId);
		if (!queue || queue.destroyed || !queue.connection) return false;

		const np = queue.nowPlaying();
		if (!np || !args[0]) {
			await msg.react(X_MARK);
			return false;
		}

		const ptlen = Math.trunc(queue.previousTracks.length / 2);
		try {
			const index = parseInt(args[0], 10);
			const foundTrack = queue.remove(queue.getTrackPosition(index - ptlen - 2));
			queue.tracks.unshift(foundTrack);
		} catch (error) {
			await sendMessage(msg.channel, `Raise failed, double check provided index`);
			return false;
		}

		await msg.react(WHITE_CHECK_MARK);
		return true;
	}
}

export default new RaiseCommand(cmdConfig);
