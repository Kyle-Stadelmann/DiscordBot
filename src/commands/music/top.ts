import { Message } from "discord.js";
import { bdbot } from "../../app.js";
import { WHITE_CHECK_MARK, X_MARK } from "../../constants.js";
import { Command, CommandCategory, CommandConfig } from "../../types/command.js";
import { getSearchResult, isQueueValid } from "../../util/music-helpers.js";
import { sendErrorMessage } from "../../util/message-channel.js";

const cmdConfig: CommandConfig = {
	name: "top",
	description: "Adds a track to the front of queue",
	category: CommandCategory.Music,
	usage: "top [link OR search phrase]",
	examples: ["top https://www.youtube.com/watch?v=dQw4w9WgXcQ", "top darude sandstorm"],
};

class TopCommand extends Command {
	public async run(msg: Message, args: string[]): Promise<boolean> {
		const queue = bdbot.player.queues.resolve(msg.guildId);
		if (!isQueueValid(queue) || args.length === 0) {
			await sendErrorMessage(
				msg.channel,
				"Music command failed. Please start a queue using the `play` command first, or check command arguments!"
			);
			return false;
		}

		const np = queue.currentTrack;
		if (!np) {
			await msg.react(X_MARK);
			return false;
		}

		const foundTrack = await getSearchResult(args, msg.author)
			// TODO: would anyone ever want to top a whole playlist?
			.then((x) => x.tracks[0]);

		// dont think this can happen but just to be safe
		if (!foundTrack) return false;

		queue.insertTrack(foundTrack, 0);

		await msg.react(WHITE_CHECK_MARK);
		return true;
	}
}

export default new TopCommand(cmdConfig);
