import { CommandInteraction } from "discord.js";
import { Discord, Slash } from "discordx";
import { Category } from "@discordx/utilities";
import { bdbot } from "../../app.js";
import { CommandCategory } from "../../types/command.js";
import { isQueueValid } from "../../util/music-helpers.js";

@Discord()
@Category(CommandCategory.Music)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ShuffleCommand {
	@Slash({name: "shuffle", description: "Shuffles the queue"})
	async run(interaction: CommandInteraction): Promise<boolean> {
		const queue = bdbot.player.queues.resolve(interaction.guildId);
		if (!isQueueValid(queue) || !queue.currentTrack) {
			await interaction.reply("Music command failed. Please start a queue using the `play` command first!");
			return false;
		}

		if (queue.size < 3) {
			await interaction.reply("Shuffle failed, the queue isn't big enough!");
			return false;
		}

		queue.tracks.shuffle();
		await interaction.reply("The queue has been shuffled!")
		return true;
	}
}
