import { Message, MessageEmbed } from "discord.js";
import { bdbot } from "../../app";
import { PREFIX } from "../../constants";
import { Command } from "../../interfaces/command";
import { CommandConfig } from "../../types/types";
import { sendEmbeds } from "../../util";

const cmdConfig: CommandConfig = {
	name: "help",
	description: "Lists all commands that this bot currently has to offer.",
	usage: `help`,
	allowInDM: true
}

class HelpCommand extends Command {
	public async run(msg: Message): Promise<boolean> {
		const cmds = bdbot.commandContainer.commands;
		let cmdStr = "";
		cmds.forEach((cmd) => {
			cmdStr += `${cmd.name}\n`;
		});
	
		const roleInfo = new MessageEmbed()
			.addField("All Commands", cmdStr)
			.setThumbnail(msg.guild ? msg.guild.iconURL() : "")
			.setFooter(`Use '${PREFIX}commandName help' to recieve instructions on how to use any command.`)
			.setColor(0x0);
	
		await sendEmbeds(msg.channel, [roleInfo]);
		
		return true;
	}
}

export default new HelpCommand(cmdConfig);