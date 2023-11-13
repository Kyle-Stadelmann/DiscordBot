import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { Category } from "@discordx/utilities";
import { Discord, Slash, SlashOption } from "discordx";
import { bdbot } from "../../app.js";
import { CommandCategory } from "../../types/command.js";
import { getSearchResult, isQueueValid } from "../../util/index.js";

@Discord()
@Category(CommandCategory.Music)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class TopCommand {
	@Slash({name: "top", description: "Adds a track to the front of queue", dmPermission: false})
	async run(
		@SlashOption({
			name: "query",
			description: "Search query or music link to add to the queue",
			required: true,
			type: ApplicationCommandOptionType.String
		})
		query: string,
		interaction: CommandInteraction
	): Promise<boolean> {
		const queue = bdbot.player.queues.resolve(interaction.guildId);
		if (!isQueueValid(queue) || !queue.currentTrack) {
			await interaction.reply("Music command failed. Please start a queue using the `play` command first!");
			return false;
		}

		const foundTrack = await getSearchResult(query, interaction.user)
			// TODO: would anyone ever want to top a whole playlist?
			.then((x) => x.tracks[0]);

		// dont think this can happen but just to be safe
		if (!foundTrack) {
			await interaction.reply("Couldn't find a track. Please report this bug to the bot developers");
			return false;
		}

		queue.insertTrack(foundTrack, 0);

		await interaction.reply(`Added ${foundTrack.title} to the front of the queue.`);
		return true;
	}
}
