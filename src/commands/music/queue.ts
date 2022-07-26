import { Message } from "discord.js";
import { bdbot } from "../../app.js";
import { Command, CommandConfig } from "../../types/command.js";
import { sendMessage } from "../../util/index.js";

const cmdConfig: CommandConfig = {
	name: "queue",
	description: "shows music queue",
	usage: "queue",
};

class QueueCommand extends Command {
	public async run(msg: Message): Promise<boolean> {
		const queue = bdbot.player.getQueue(msg.guildId);
		if (!queue || queue.destroyed || !queue.connection) return false;

		let counter = 1;
		let tracks = "```";
		let np = queue.nowPlaying();

		if (np) {
			tracks += `Currently Playing: ${np.title} by ${np.author}\n`;
			tracks += `-----------------------------------------------\n`;
		}
		queue.tracks.forEach((track) => {
			tracks += `(${counter}): ${track.title} by ${track.author}\n`;
			counter++;
		});
		tracks += "```";

		// daniel got this case to happen but it was a bug with play
		if (tracks === "``````") tracks = "Queue is empty";

		sendMessage(msg.channel, tracks);
		return true;
	}
}

export default new QueueCommand(cmdConfig);
