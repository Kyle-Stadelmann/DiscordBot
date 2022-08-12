import { Message } from "discord.js";
import { bdbot } from "../../app.js";
import { WHITE_CHECK_MARK, X_MARK } from "../../constants.js";
import { Command, CommandConfig } from "../../types/command.js";
import { shuffleQueue } from "../../util/music-helpers.js";

const cmdConfig: CommandConfig = {
	name: "shuffle",
	description: "Shuffles the queue",
	usage: "shuffle",
};

class ShuffleCommand extends Command {
	public async run(msg: Message): Promise<boolean> {
		const queue = bdbot.player.getQueue(msg.guildId);
		if (!queue || queue.destroyed || !queue.connection) return false;

        const np = queue.nowPlaying();
        if (!np || queue.tracks.length < 3) {
            await msg.react(X_MARK);
            return false;
        }

		queue.tracks = shuffleQueue(queue.tracks);
		await msg.react(WHITE_CHECK_MARK);
        return true;
	}
}

export default new ShuffleCommand(cmdConfig);
