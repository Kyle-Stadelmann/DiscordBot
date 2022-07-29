import { Message } from "discord.js";
import { bdbot } from "../../app.js";
import { WHITE_CHECK_MARK, X_MARK } from "../../constants.js";
import { Command, CommandConfig } from "../../types/command.js";
import { sendMessage } from "../../util/message_channel.js";

const cmdConfig: CommandConfig = {
	name: "jump",
	description: "Fast forwards the queue to the specified index",
	usage: "jump",
};

class JumpCommand extends Command {
	public async run(msg: Message, args: string[]): Promise<boolean> {
		const queue = bdbot.player.getQueue(msg.guildId);
        if (!queue || queue.destroyed || !queue.connection) return false;

        const np = queue.nowPlaying();
        if (!np || !args[0]) {
            await msg.react(X_MARK);
            return false;
        }
		
        const ptlen = Math.trunc(queue.previousTracks.length/2);
        const index = parseInt(args[0], 10);
        try {
            queue.skipTo(queue.getTrackPosition(index - ptlen - 2));
        } catch (error) {
            await sendMessage(msg.channel,
                `Jump failed, double check provided index`);
            return false;
        }

        await msg.react(WHITE_CHECK_MARK);
		return true;
	}
}

export default new JumpCommand(cmdConfig);
