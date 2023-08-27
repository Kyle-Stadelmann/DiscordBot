import { Message } from "discord.js";
import { bdbot } from "../../app.js";
import { Command, CommandCategory, CommandConfig } from "../../types/command.js";
import { sendMessage } from "../../util/message-channel.js";

const cmdConfig: CommandConfig = {
	name: "np",
	description: "Shows the currently playing track",
	category: CommandCategory.Music,
	usage: "np",
	aliases: ["nowplaying"],
};

class NowPlayingCommand extends Command {
	public async run(msg: Message): Promise<boolean> {
		const queue = bdbot.player.queues.resolve(msg.guildId);
		const np = queue.currentTrack;
		// TODO: Should this be queue.history.getSize() or queue.getSize() ?
		const position = Math.round(queue.history.getSize() / 2);

		if (!np) {
			await sendMessage(msg.channel, `No track currently playing`);
			return false;
		}

		let npmsg = ``;
		npmsg += `Now Playing: (#${position}) ${np.title} by ${np.author}\n`;
		npmsg += `${queue.node.createProgressBar()}\n`;
		npmsg += `${np.url}\n`;

		await sendMessage(msg.channel, npmsg);
		return true;
	}
}

export default new NowPlayingCommand(cmdConfig);
