import { CommandInteraction } from "discord.js";
import { Category } from "@discordx/utilities";
import { Discord, Slash } from "discordx";
import { bdbot } from "../../app.js";
import { CommandCategory } from "../../types/command.js";
import { isQueueValid } from "../../util/music-helpers.js";

@Discord()
@Category(CommandCategory.Music)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class NowPlayingCommand {
	@Slash({name: "np", description: "Shows the currently playing track", dmPermission: false})
	async run(interaction: CommandInteraction): Promise<boolean> {
		const queue = bdbot.player.queues.resolve(interaction.guildId);

		if (!isQueueValid(queue) || !queue.currentTrack) {
			await interaction.reply("Music command failed. Please start a queue using the `play` command first!");
			return false;
		}

		const np = queue.currentTrack;
		const position = Math.round(queue.history.size + 1);

		let npmsg = ``;
		npmsg += `Now Playing: (#${position}) ${np.title} by ${np.author}\n`;
		npmsg += `${queue.node.createProgressBar()}\n`;
		npmsg += `${np.url}\n`;

		await interaction.reply(npmsg);
		return true;
	}
}
