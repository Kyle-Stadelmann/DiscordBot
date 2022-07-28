import { Message } from "discord.js";
import { bdbot } from "../../app.js";
import { Command, CommandConfig } from "../../types/command.js";
import { sendMessage } from "../../util/message_channel.js";

const cmdConfig: CommandConfig = {
	name: "np",
	description: "shuffles the queue",
	usage: "np",
	aliases: ["nowplaying"],
};

class NowPlayingCommand extends Command {
	public async run(msg: Message): Promise<boolean> {
		const queue = bdbot.player.getQueue(msg.guildId);
		const np = queue.nowPlaying();

		if (!np) {
			await sendMessage(msg.channel, `No track currently playing`);
			return false;
		}

		let npmsg = ``;
		npmsg += `Now Playing: ${np.title} by ${np.author}\n`;
		npmsg += `${queue.createProgressBar()}\n`;
		npmsg += `${np.url}\n`;

		await sendMessage(msg.channel, npmsg);
		return true;
	}
}

export default new NowPlayingCommand(cmdConfig);
