import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { Category } from "@discordx/utilities";
import { bdbot } from "../../app.js";
import { CommandCategory } from "../../types/command.js";
import { isQueueValid } from "../../util/index.js";

@Discord()
@Category(CommandCategory.Music)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class JumpCommand {
	@Slash({name: "jump", description: "Fast forwards the queue to the specified index", dmPermission: false})
	async run(
		@SlashOption({
			name: "index",
			description: "The index to fast forward to",
			required: true,
			type: ApplicationCommandOptionType.Number
		})
		index: number,
		interaction: CommandInteraction
	): Promise<boolean> {
		const queue = bdbot.player.queues.resolve(interaction.guildId);
		if (!isQueueValid(queue) || !queue.currentTrack) {
			await interaction.reply("Music command failed. Please start a queue using the `play` command first, or check command arguments!");
			return false;
		}

		const ptlen = queue.history.size;
		try {
			queue.node.skipTo(queue.node.getTrackPosition(index - ptlen - 2));
		} catch (error) {
			await interaction.reply("Jump failed, double check provided index.");
			return false;
		}

		await interaction.reply("The queue has been fast forwarded!");
		return true;
	}
}
