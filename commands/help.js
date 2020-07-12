const discord = require('discord.js');

module.exports.help = {
    commandName: "help",
	description: "Lists all commands that this bot currently has to offer.",
	usage: `help`,
}

module.exports.disabled = false;

module.exports.run = (bot, msg, args) => {
	let outputStr = "";

	bot.commands.forEach((value, key, collection) => {
		outputStr += value.help.commandName + "\n";
	});

	let roleInfo = new discord.MessageEmbed()
		.addField("All Commands", outputStr)
		.setThumbnail(msg.guild.iconURL)
		.setFooter(`Use '${bot.constants.PREFIX}commandName help' to recieve instructions on how to use any command.`)
		.setColor(0x0)

	msg.channel.send(roleInfo);

	return true;
}
