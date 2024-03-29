/* eslint-disable @typescript-eslint/no-unused-vars */
// eslint-disable-next-line max-classes-per-file
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Message } from "discord.js";
import type { ButtonInteraction } from "discord.js";
import { ButtonComponent, Discord } from "discordx";
import { Command, CommandCategory, CommandConfig } from "../../types/command.js";
import { WHITE_CHECK_MARK } from "../../constants.js";

const cmdConfig: CommandConfig = {
	name: "start",
	description: "Starts a 'queue' for a specified game.",
	category: CommandCategory.Utility,
	usage: `start @game-role`,
	examples: ["start @skowhen", "start @owhen"],
	disabled: true,
};

class StartCommand extends Command {
	public async run(msg: Message): Promise<boolean> {
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
class StartBtn {
	@ButtonComponent({ id: "start-btn" })
	private async myBtn(interaction: ButtonInteraction) {
		await interaction.reply(`hello ${interaction.member}`);
	}
}

export default new StartCommand(cmdConfig);
