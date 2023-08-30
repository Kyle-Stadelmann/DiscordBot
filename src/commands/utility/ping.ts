import { EmbedBuilder, CommandInteraction } from "discord.js";
import { Discord, Slash } from "discordx";
import { Category } from "@discordx/utilities";
import { TYPESCRIPT_URL } from "../../constants.js";
import { getRandomHexColorStr } from "../../util/index.js";
import { CommandCategory } from "../../types/command.js";
import { client } from "../../app.js";

// Probably won't work in pm2
const version = process.env.npm_package_version;

@Discord()
@Category(CommandCategory.Utility)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class PingCommand {
	@Slash({name: "ping", description: "Sends pong! for testing purposes"})
	async run(interaction: CommandInteraction): Promise<boolean> {
		const embed = new EmbedBuilder()
			.setImage(client.user.avatarURL())
			.setTitle("pong!")
			.setFooter({ text: `version ${version}`, iconURL: TYPESCRIPT_URL })
			.setColor(getRandomHexColorStr());

		await interaction.reply({embeds: [embed]});
		return true;
	}
}
