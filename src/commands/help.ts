import { Message, MessageEmbed } from "discord.js";
import { PREFIX } from "../constants";
import { Command } from "../interfaces/command";
import { CommandConfig } from "../types/types";

const cmdConfig: CommandConfig = {
	name: "help",
	description: "Lists all commands that this bot currently has to offer.",
	usage: `help`,
	allowInDM: true
}

class HelpCommand extends Command {
	public async run(msg: Message): Promise<boolean> {
		let cmdStr = "";

		bot.commands.forEach((value) => {
			cmdStr += value.help.commandName + "\n";
		});
	
		const roleInfo = new MessageEmbed()
			.addField("All Commands", cmdStr)
			.setThumbnail(msg.guild ? msg.guild.iconURL() : "")
			.setFooter(`Use '${PREFIX}commandName help' to recieve instructions on how to use any command.`)
			.setColor(0x0);
	
		msg.channel.send({ embeds: [roleInfo] });
	
		return true;
	}
}

export default new HelpCommand(cmdConfig);