const discord = require('discord.js');

module.exports.help = {
	commandName: "bipen",
	description: "Sends an important Bipen quote.",
	usage: `bipen`
}

module.exports.disabled = false;

module.exports.run = async (bot, msg, args) => {
	let message = "I'm a dragon, Rob! ~ *Bipen*";
	
	let embed = new discord.RichEmbed()
		.addField("Bipen", message)
		.setThumbnail(bot.constants.BIPEN_IMG_URL)
		.setFooter(`R.I.P. Bipen 08/2012`)
		.setColor(0x0)

	msg.channel.send(embed);
	return true;
}
