import { CommandInteraction } from "discord.js";
import { Category } from "@discordx/utilities";
import { Discord, Slash } from "discordx";
import { bdbot } from "../../app.js";
import { CommandCategory } from "../../types/command.js";

@Discord()
@Category(CommandCategory.Music)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class StopCommand {
	@Slash({name: "stop", description: "Stops the currently playing music and closes the queue", dmPermission: false})
	async run(interaction: CommandInteraction): Promise<boolean> {
		const queue = bdbot.player.queues.resolve(interaction.guildId);
		if (queue) {
			queue.delete();
			await interaction.reply("Queue has been closed.")
		}
		return true;
	}
}
