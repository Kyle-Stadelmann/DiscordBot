import { CommandInteraction } from "discord.js";
import { Category } from "@discordx/utilities";
import { Discord } from "discordx";
import { bdbot } from "../../app.js";
import { CommandCategory } from "../../types/command.js";
import { getSearchResult, isQueueValid } from "../../util/music-helpers.js";

const cmdConfig: CommandConfig = {
	name: "top",
	description: "Adds a track to the front of queue",
	category: CommandCategory.Music,
	usage: "top [link OR search phrase]",
	examples: ["top https://www.youtube.com/watch?v=dQw4w9WgXcQ", "top darude sandstorm"],
};

@Discord()
@Category(CommandCategory.Music)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class TopCommand {
	async run(interaction: CommandInteraction): Promise<boolean> {
		const queue = bdbot.player.queues.resolve(interaction.guildId);
		if (!isQueueValid(queue) || !queue.currentTrack) {
			await interaction.reply("Music command failed. Please start a queue using the `play` command first!");
			return false;
		}

		const foundTrack = await getSearchResult(args, msg.author)
			// TODO: would anyone ever want to top a whole playlist?
			.then((x) => x.tracks[0]);

		// dont think this can happen but just to be safe
		if (!foundTrack) return false;

		queue.insertTrack(foundTrack, 0);

		await interaction.reply(`Added ${foundTrack.title} to the front of the queue.`);
		return true;
	}
}
