import { CommandInteraction } from "discord.js";
import { Discord, Slash } from "discordx";
import { Category } from "@discordx/utilities";
import { bdbot } from "../../app.js";
import { MUSICAL_NOTES } from "../../constants.js";
import { CommandCategory } from "../../types/command.js";
import { isQueueValid } from "../../util/index.js";

@Discord()
@Category(CommandCategory.Music)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class QueueCommand {
	@Slash({ name: "queue", description: "Shows the current music queue", dmPermission: false })
	async run(interaction: CommandInteraction): Promise<boolean> {
		const queue = bdbot.player.queues.resolve(interaction.guildId);
		if (!isQueueValid(queue) || !queue.currentTrack) {
			await interaction.reply("Music command failed. Please start a queue using the `play` command first!");
			return false;
		}

		const np = queue.currentTrack;

		const ptlen = queue.history.size;
		const currentPos = ptlen + 1;
		let tracks = "```";

		tracks +=
			`Queue length: ${currentPos + queue.tracks.size}, ` +
			`Current Position: ${currentPos}\n` +
			`----------------------------------------------------------------\n` +
			`[${MUSICAL_NOTES}] (${currentPos}) ${np.title} - ` +
			`requested by ${np.requestedBy.username}\n`;

		for (let i = 0; i < queue.tracks.size && i < 9; i += 1) {
			const track = queue.tracks.at(i);
			tracks += `(${currentPos + 1 + i}) ${track.title} - `;
			tracks += `requested by ${track.requestedBy.username}\n`;
		}

		tracks += "```";

		await interaction.reply(tracks);
		return true;
	}
}
