import { Message } from "discord.js";
import { bdbot } from "../../app.js";
import { MUSICAL_NOTES } from "../../constants.js";
import { Command, CommandCategory, CommandConfig } from "../../types/command.js";
import { sendMessage } from "../../util/index.js";

const cmdConfig: CommandConfig = {
	name: "queue",
	description: "Shows the current music queue",
	category: CommandCategory.Music,
	usage: "queue",
};

// There may be a way to completely rework this command so that you can see
// all the songs in the queue, but that'll require a lot of brain power

// could potentially renovate to add a command where you jump to the index
// of a specific track which also works with previous tracks
class QueueCommand extends Command {
	public async run(msg: Message): Promise<boolean> {
		const queue = bdbot.player.queues.resolve(msg.guildId);
		if (!queue || queue.deleted || !queue.connection) return false;

		const np = queue.currentTrack;
		if (!np) {
			await sendMessage(msg.channel, `No tracks in the queue`);
			return false;
		}

		const ptlen = Math.trunc(queue.history.getSize() / 2);
		const currentPos = ptlen + 1;
		let tracks = "```";

		tracks +=
			`Queue length: ${currentPos + queue.tracks.size}, ` +
			`Current Position: ${currentPos}\n` +
			`----------------------------------------------------------------\n` +
			`[${MUSICAL_NOTES}] (${ptlen + 1}) ${np.title} - ` +
			`requested by ${np.requestedBy.username}\n`;

		for (let i = 0; i < queue.tracks.size && i < 9; i += 1) {
			tracks += `(${ptlen + 2 + i}) ${queue.tracks[i].title} - `;
			tracks += `requested by ${queue.tracks[i].requestedBy.username}\n`;
		}

		tracks += "```";

		await sendMessage(msg.channel, tracks);
		return true;
	}
}

export default new QueueCommand(cmdConfig);
