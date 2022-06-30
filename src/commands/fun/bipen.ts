import { Message, MessageEmbed } from "discord.js";
import { BIPEN_IMG_URL } from "../../constants";
import { Command, CommandCategory } from "../../interfaces/command";
import { CommandConfig } from "../../types/types";

const cmdConfig: CommandConfig = {
	name: "bipen",
	description: "Sends an important Bipen quote.",
	usage: "bipen",
};

class BipenCommand extends Command {
	run = run;
}

export default new BipenCommand(config);

async function run(msg: Message, args: string[]): Promise<boolean> {
	let message = "I'm a dragon, Rob! ~ *Bipen*";

	let embed = new MessageEmbed()
		.addField("Bipen", message)
		.setImage(BIPEN_IMG_URL)
		.setFooter(`R.I.P. Bipen 08/2012`)
		.setColor(0x0);

	await msg.channel.send({ embeds: [embed] });
	return true;
}
