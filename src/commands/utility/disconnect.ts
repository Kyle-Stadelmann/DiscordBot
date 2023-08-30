import { getVoiceConnection } from "@discordjs/voice";
import { CommandInteraction } from "discord.js";
import { Discord, Slash } from "discordx";
import { Category } from "@discordx/utilities";
import { bdbot } from "../../app.js";
import { CommandCategory } from "../../types/command.js";

@Discord()
@Category(CommandCategory.Utility)
export class DisconnectCommand {
	@Slash({ name: "disconnect", description: "BDBot disconnects from its current voice channel", dmPermission: false})
	async run(interaction: CommandInteraction): Promise<boolean> {
		const connection = getVoiceConnection(interaction.guildId);
		const musicQueue = bdbot.player.queues.resolve(interaction.guildId);

		if (!connection && !musicQueue) {
			await interaction.reply({content: "Couldn't disconnect from channel, bot is not in a channel!", ephemeral: true});
			return false;
		}

		if (connection) connection.destroy();
		if (musicQueue) musicQueue.delete();

		return true;
	}
}
