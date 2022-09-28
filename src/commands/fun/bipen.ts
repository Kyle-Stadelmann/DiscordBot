import { Message, EmbedBuilder } from "discord.js";
import { CommandConfig, Command, CommandCategory } from "../../types/command.js";
import { random, sendEmbeds } from "../../util/index.js";

const cmdConfig: CommandConfig = {
	name: "bipen",
	description: "Sends an important Bipen quote.",
	category: CommandCategory.Fun,
	usage: "bipen",
	allowInDM: true,
};

const BIPEN_IMG_URL = "https://i.imgur.com/cIoLOxW.jpg";
const SHINY_BIPEN_IMG_URL = "https://i.imgur.com/E8KOiTT.png";
// const SHINY_POKEMON_CHANCE = 1/8192;
const SHINY_BIPEN_CHANCE = (1 / 4000) * 100; // percentage

class BipenCommand extends Command {
	public async run(msg: Message): Promise<boolean> {
		const message = "I'm a dragon, Rob! ~ *Bipen*";

		const bipenPicUrl = random(SHINY_BIPEN_CHANCE) ? SHINY_BIPEN_IMG_URL : BIPEN_IMG_URL;

		const embed = new EmbedBuilder()
			.addFields({ name: "Bipen", value: message })
			.setImage(bipenPicUrl)
			.setFooter({ text: `R.I.P. Bipen 08/2012` })
			.setColor(0x0);

		await sendEmbeds(msg.channel, [embed]);
		return true;
	}
}

export default new BipenCommand(cmdConfig);
