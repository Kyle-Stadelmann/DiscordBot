/* eslint-disable @typescript-eslint/no-unused-vars */
// eslint-disable-next-line max-classes-per-file
import { Message, MessageActionRow, MessageButton, Modal } from "discord.js";
import type { ButtonInteraction } from "discord.js";
import { ButtonComponent, Discord } from "discordx";
import { Command, CommandConfig } from "../../types/command.js";
import { WHITE_CHECK_MARK } from "../../constants.js";

const cmdConfig: CommandConfig = {
	name: "start",
	description: "Starts a 'queue' for a specified game.",
	usage: `start @game-role`,
	examples: ["start @skowhen", "start @owhen"],
	disabled: true,
};

class StartCommand extends Command {
	public async run(msg: Message): Promise<boolean> {
		const playBtn = new MessageButton()
			.setLabel("Join")
			.setEmoji(WHITE_CHECK_MARK)
			.setStyle("PRIMARY")
			.setCustomId("start-btn");

		const msgActionRow = new MessageActionRow().addComponents(playBtn);

		await msg.channel.send({ components: [msgActionRow] });

		return true;
	}
}

@Discord()
class StartBtn {
	@ButtonComponent("start-btn")
	private async myBtn(interaction: ButtonInteraction) {
		await interaction.reply(`hello ${interaction.member}`);
	}
}

export default new StartCommand(cmdConfig);
