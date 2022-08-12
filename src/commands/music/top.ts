import { Message } from "discord.js";
import { bdbot } from "../../app.js";
import { WHITE_CHECK_MARK, X_MARK } from "../../constants.js";
import { Command, CommandConfig } from "../../types/command.js";
import { getSearchResult } from "../../util/music-helpers.js";

const cmdConfig: CommandConfig = {
	name: "top",
	description: "Adds a track to the front of queue",
	usage: "top [link OR search phrase]",
    examples: [
        ">top https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        ">top darude sandstorm"
    ],
};

class TopCommand extends Command {
	public async run(msg: Message, args: string[]): Promise<boolean> {
		const queue = bdbot.player.getQueue(msg.guildId);
        if (!queue || queue.destroyed || !queue.connection) return false;

        const np = queue.nowPlaying();
        if (!np || !args[0]) {
            await msg.react(X_MARK);
            return false;
        }
		
        const foundTrack = await getSearchResult(args, msg.author)
        // TODO: would anyone ever want to top a whole playlist?
        .then(x => x.tracks[0]);

        // dont think this can happen but just to be safe
        if (!foundTrack) return false;

        queue.tracks.unshift(foundTrack);

        await msg.react(WHITE_CHECK_MARK);
		return true;
	}
}

export default new TopCommand(cmdConfig);
