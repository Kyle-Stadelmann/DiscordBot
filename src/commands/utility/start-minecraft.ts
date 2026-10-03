import wol from "wake_on_lan";
import { CommandInteraction, InteractionContextType } from "discord.js";
import { Discord, Guild, Slash } from "discordx";
import { Category } from "@discordx/utilities";
import { CommandCategory } from "../../types/command.js";
import { BD5_DEV_SERVER_IDS } from "../../constants.js";

const macAddress = process.env.MINECRAFT_SERVER_MAC?.trim().replaceAll("-", ":");
if (!macAddress || !/^(?:[\da-f]{2}:){5}[\da-f]{2}$/i.test(macAddress)) {
	throw new Error("MINECRAFT_SERVER_MAC must be set to a valid MAC address in the bot's .env file.");
}

@Discord()
@Category(CommandCategory.Utility)
@Guild(BD5_DEV_SERVER_IDS)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class StartMinecraftCommand {
	@Slash({
		name: "start-minecraft",
		description: "Sends a Wake-on-LAN request to start the Minecraft server",
		contexts: [InteractionContextType.Guild],
	})
	async run(interaction: CommandInteraction): Promise<boolean> {
		await interaction.deferReply();
		try {
			await new Promise<void>((resolve, reject) => {
				wol.wake(macAddress!, (error: Error | undefined) => {
					if (error) reject(error);
					else resolve();
				});
			});
		} catch (error) {
			console.error("Failed to send Minecraft server Wake-on-LAN request:", error);
			await interaction.editReply(
				"Failed to send the wake request. Please contact the bot maintainers for help."
			);
			return false;
		}

		await interaction.editReply("Wake request sent! Give the Minecraft server a few minutes to start up.");
		return true;
	}
}
