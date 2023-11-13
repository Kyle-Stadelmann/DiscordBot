import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { Category } from "@discordx/utilities";
import { Track } from "discord-player";
import { bdbot } from "../../app.js";
import { CommandCategory } from "../../types/command.js";
import { isQueueValid } from "../../util/index.js";

// TODO: Not sure if this should stay a separate command from query
// could get messy if you try to combine

@Discord()
@Category(CommandCategory.Music)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class RaiseCommand {
	@Slash({name: "raise", description: "Moves specified track number to front of queue", dmPermission: false})
	async run(
		@SlashOption({
			name: "index",
			description: "The track number to raise",
			required: true,
			type: ApplicationCommandOptionType.Number
		})
		index: number,
		interaction: CommandInteraction
	): Promise<boolean> {
		const queue = bdbot.player.queues.resolve(interaction.guildId);
		if (!isQueueValid(queue) || !queue.currentTrack) {
			await interaction.reply("Music command failed. Please start a queue using the `play` command first!");
			return false;
		}

		if (index < 0 || index >= queue.size) {
			await interaction.reply("Raise failed, double check provided index.");
			return false;
		}

		const ptlen = queue.history.size;
		let track: Track;
		try {
			track = queue.tracks.at(index - ptlen - 2);
			queue.moveTrack(track, 0);
		} catch (error) {
			await interaction.reply("Raise failed, maybe double check provided index.");
			return false;
		}

		await interaction.reply(`${track.title} has been raised.`);
		return true;
	}
}
