import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { Category } from "@discordx/utilities";
import { bdbot } from "../../app.js";
import { CommandCategory } from "../../types/command.js";
import { findTrack, isQueueValid } from "../../util/music-helpers.js";

@Discord()
@Category(CommandCategory.Music)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class QueryCommand {
	@Slash({name: "query", description: "Moves a track with the specified name to the front of the queue", dmPermission: false})
	async run(
		@SlashOption({
			name: "track",
			description: "The name (or part of the name) of the track to move",
			required: true,
			type: ApplicationCommandOptionType.String
		})
		trackQuery: string,
		interaction: CommandInteraction
	): Promise<boolean> {
		const queue = bdbot.player.queues.resolve(interaction.guildId);
		if (!isQueueValid(queue) || !queue.currentTrack) {
			await interaction.reply("Music command failed. Please start a queue using the `play` command first!");
			return false;
		}

		const track = findTrack(trackQuery, queue);

		if (!track) {
			await interaction.reply(`Query failed, ensure your search is part of the track title.`)
			return false;
		}

		queue.moveTrack(track, 0);

		await interaction.reply(`${track.title} was elevated in the queue.`);
		return true;
	}
}
