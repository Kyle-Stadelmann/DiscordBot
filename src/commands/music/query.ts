import { Message } from "discord.js";
import { bdbot } from "../../app.js";
import { WHITE_CHECK_MARK, X_MARK } from "../../constants.js";
import { Command, CommandCategory, CommandConfig } from "../../types/command.js";
import { sendMessage } from "../../util/message-channel.js";
import { findTrack } from "../../util/music-helpers.js";
import { isNullOrUndefined } from "../../util/general.js";

const cmdConfig: CommandConfig = {
	name: "query",
	description: "Moves a track with the specified name to the front of the queue",
	category: CommandCategory.Music,
	usage: "query [some part of the track's title]",
	examples: ["query Rebecca Black - Friday", "query friday"],
};

class QueryCommand extends Command {
	public async run(msg: Message, args: string[]): Promise<boolean> {
		const queue = bdbot.player.queues.resolve(msg.guildId);
		if (!queue || queue.deleted || !queue.connection) return false;

		const np = queue.currentTrack;
		if (!np || !args[0]) {
			await msg.react(X_MARK);
			return false;
		}

		const track = findTrack(args.join(" "), queue);

		if (isNullOrUndefined(track)) {
			await sendMessage(msg.channel, `Query failed, ensure your search is part of the track title`);
			return false;
		}
		
		queue.moveTrack(track, 0);

		await msg.react(WHITE_CHECK_MARK);
		return true;
	}
}

export default new QueryCommand(cmdConfig);
