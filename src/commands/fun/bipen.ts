import { Message, MessageEmbed } from "discord.js";
import { BIPEN_IMG_URL } from "../../constants";
import { Command } from "../../interfaces/command";
import { CommandConfig } from "../../types/types";
import { sendEmbeds } from "../../util";

const cmdConfig: CommandConfig = {
	name: "bipen",
	description: "Sends an important Bipen quote.",
	usage: "bipen",
};

class BipenCommand extends Command {
	public async run(msg: Message): Promise<boolean> {
		const message = "I'm a dragon, Rob! ~ *Bipen*";
	
		const embed = new MessageEmbed()
			.addField("Bipen", message)
			.setImage(BIPEN_IMG_URL)
			.setFooter(`R.I.P. Bipen 08/2012`)
			.setColor(0x0);
	
		await sendEmbeds(msg.channel, [embed]);
		return true;
	}
}

export default new BipenCommand(cmdConfig);