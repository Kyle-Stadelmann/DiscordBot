import { CommandInteraction } from "discord.js";
import { Category } from "@discordx/utilities";
import { Discord, Slash } from "discordx";
import { bdbot } from "../../app.js";
import { CommandCategory } from "../../types/command.js";
import { isQueueValid } from "../../util/index.js";

@Discord()
@Category(CommandCategory.Music)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class PauseCommand {
	@Slash({name: "pause", description: "Pauses the current track", dmPermission: false})
	async run(interaction: CommandInteraction): Promise<boolean> {
		const queue = bdbot.player.queues.resolve(interaction.guildId);

		if (!isQueueValid(queue)) {
			await interaction.reply("Music command failed. Please start a queue using the `play` command first!");
			return false;
		}

		queue.node.setPaused(true);
		return true;
	}
}
