import { ApplicationCommandType, MessageContextMenuCommandInteraction } from "discord.js";
import { ContextMenu, Discord } from "discordx";
import { Category } from "@discordx/utilities";
import { BD5_DEV_SERVER_IDS } from "../constants.js";
import { tryAddAfkPics } from "../util/afk-pic-helper.js";
import { CommandCategory } from "../types/command.js";

@Discord()
@Category(CommandCategory.ContextMenu)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class AddAfkPics {
	@ContextMenu({
		name: "Add pic to AFK Pics!",
		type: ApplicationCommandType.Message,
		guilds: [BD5_DEV_SERVER_IDS],
	})
	async tryAddAkfPic(interaction: MessageContextMenuCommandInteraction) {
		const { attachments } = interaction.targetMessage;
		if (attachments.size === 0) {
			await interaction.reply("Failed to add any AFK Pics. No images found.");
			return;
		}
		await interaction.deferReply();
		await tryAddAfkPics(
			attachments.map((a) => a.url),
			interaction
		);
	}
}
