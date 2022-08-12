import { Message } from "discord.js";
import { bdbot } from "../../app.js";
import { PLAYER_SITES, WHITE_CHECK_MARK, X_MARK } from "../../constants.js";
import { Command, CommandConfig } from "../../types/command.js";

const cmdConfig: CommandConfig = {
	name: "top",
	description: "Adds a track to the front of queue",
	usage: "top",
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
		
        let search = "";
        if (args[0].slice(0, 8) === "https://" && PLAYER_SITES.some((site) => args[0].includes(site))) {
            search = args[0];
        } else search = args.join(" ");

        const foundTrack = await bdbot.player.search(search, {
            requestedBy: msg.member,
        }).then(x => x.tracks[0]);

        // dont think this can happen but just to be safe
        if (!foundTrack) return false;

        queue.tracks.unshift(foundTrack);

        await msg.react(WHITE_CHECK_MARK);
		return true;
	}
}

export default new TopCommand(cmdConfig);
