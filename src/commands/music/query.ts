import { Message } from "discord.js";
import { bdbot } from "../../app.js";
import { WHITE_CHECK_MARK, X_MARK } from "../../constants.js";
import { Command, CommandConfig } from "../../types/command.js";
import { sendMessage } from "../../util/message_channel.js";
import { findTrack } from "../../util/music-helpers.js";

const cmdConfig: CommandConfig = {
	name: "query",
	description: "Moves a track with the specified name to the front of the queue",
	usage: "query",
};

class QueryCommand extends Command {
	public async run(msg: Message, args: string[]): Promise<boolean> {
		const queue = bdbot.player.getQueue(msg.guildId);
        if (!queue || queue.destroyed || !queue.connection) return false;

        const np = queue.nowPlaying();
        if (!np || !args[0]) {
            await msg.react(X_MARK);
            return false;
        }
		
        try {
            const foundTrack = queue.remove(findTrack(args.join(" "), queue));
            queue.tracks.unshift(foundTrack);
        } catch (error) {
            await sendMessage(msg.channel,
                `Query failed, ensure your search is part of the track title`);
            return false;
        }

        await msg.react(WHITE_CHECK_MARK);
		return true;
	}
}

export default new QueryCommand(cmdConfig);
