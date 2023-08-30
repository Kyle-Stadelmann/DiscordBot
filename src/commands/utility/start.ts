// eslint-disable-next-line max-classes-per-file
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Message } from "discord.js";
import type { ButtonInteraction } from "discord.js";
import { ButtonComponent, Discord } from "discordx";
import { Category } from "@discordx/utilities";
import { CommandCategory } from "../../types/command.js";
import { WHITE_CHECK_MARK } from "../../constants.js";

@Discord()
@Category(CommandCategory.Utility)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class StartCommand {
	// @Slash({name: "start", description: "Starts a 'queue' for a specified game."})
	async run(msg: Message): Promise<boolean> {
		const playBtn = new ButtonBuilder()
			.setLabel("Join")
			.setEmoji(WHITE_CHECK_MARK)
			.setStyle(ButtonStyle.Primary)
			.setCustomId("start-btn");

		const msgActionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(playBtn);

		await msg.channel.send({ components: [msgActionRow] });

		return true;
	}
}

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class StartBtn {
	@ButtonComponent({ id: "start-btn" })
	private async myBtn(interaction: ButtonInteraction) {
		await interaction.reply(`hello ${interaction.member}`);
	}
}
