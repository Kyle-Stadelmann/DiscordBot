import { EmbedBuilder, CommandInteraction } from "discord.js";
import { Discord, Slash } from "discordx";
import { Category } from "@discordx/utilities";
import { CommandCategory } from "../../types/command.js";
import { random } from "../../util/index.js";

const BIPEN_IMG_URL = "https://i.imgur.com/cIoLOxW.jpg";
const SHINY_BIPEN_IMG_URL = "https://i.imgur.com/E8KOiTT.png";
// const SHINY_POKEMON_CHANCE = 1/8192;
const SHINY_BIPEN_CHANCE = (1 / 4000) * 100; // percentage

@Discord()
@Category(CommandCategory.Fun)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class BipenCommand {
	@Slash({name: "bipen", description: "Sends an important Bipen quote."})
	async run(interaction: CommandInteraction): Promise<boolean> {
		const message = "I'm a dragon, Rob! ~ *Bipen*";

		const bipenPicUrl = random(SHINY_BIPEN_CHANCE) ? SHINY_BIPEN_IMG_URL : BIPEN_IMG_URL;

		const embed = new EmbedBuilder()
			.addFields({ name: "Bipen", value: message })
			.setImage(bipenPicUrl)
			.setFooter({ text: `R.I.P. Bipen 08/2012` })
			.setColor(0x0);

		await interaction.channel.send({embeds: [embed]});
		return true;
	}
}
