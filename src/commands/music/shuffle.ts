import { Message } from "discord.js";
import { bdbot } from "../../app.js";
import { WHITE_CHECK_MARK, X_MARK } from "../../constants.js";
import { Command, CommandCategory, CommandConfig } from "../../types/command.js";

const cmdConfig: CommandConfig = {
	name: "shuffle",
	description: "Shuffles the queue",
	category: CommandCategory.Music,
	usage: "shuffle",
};

class ShuffleCommand extends Command {
	public async run(msg: Message): Promise<boolean> {
		const queue = bdbot.player.queues.resolve(msg.guildId);
		if (!queue || queue.deleted || !queue.connection) return false;

		const np = queue.currentTrack;
		if (!np || queue.size < 3) {
			await msg.react(X_MARK);
			return false;
		}

		queue.tracks.shuffle();
		await msg.react(WHITE_CHECK_MARK);
		return true;
	}
}

export default new ShuffleCommand(cmdConfig);
