import { MessageEmbed } from "discord.js";
import Constants from "../constants";

export const help = {
	commandName: "help",
	description: "Lists all commands that this bot currently has to offer.",
	usage: `help`,
};

export const dmAllow = true;
export const disabled = false;

export const run = (bot, msg, args) => {
	let outputStr = "";

	bot.commands.forEach((value) => {
		outputStr += value.help.commandName + "\n";
	});

	let roleInfo = new MessageEmbed()
		.addField("All Commands", outputStr)
		.setThumbnail(msg.guild ? msg.guild.iconURL() : "")
		.setFooter(`Use '${Constants.PREFIX}commandName help' to recieve instructions on how to use any command.`)
		.setColor(0x0);

	msg.channel.send({ embeds: [roleInfo] });

	return true;
};
