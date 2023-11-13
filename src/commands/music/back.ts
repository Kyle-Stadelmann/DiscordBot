import { CommandInteraction } from "discord.js";
import { Discord, Slash } from "discordx";
import { Category } from "@discordx/utilities";
import { bdbot } from "../../app.js";
import { CommandCategory } from "../../types/command.js";
import { isQueueValid } from "../../util/index.js";

@Discord()
@Category(CommandCategory.Music)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class BackCommand {
	@Slash({name: "back", description: "Plays the previous track", dmPermission: false})
	async run(interaction: CommandInteraction): Promise<boolean> {
		const queue = bdbot.player.queues.resolve(interaction.guildId);

		if (!isQueueValid(queue)) {
			await interaction.reply("Music command failed. Please start a queue using the `play` command first!");
			return false;
		}

		try {
			await queue.history.previous();
		} catch (error) {
			await interaction.reply("Could not find previous track");
			return false;
		}

		return true;
	}
}
