//const commando = require('discord.js-commando');
const discord = require('discord.js');

module.exports.help = {
    commandName: "listroles",
	description: "Lists the roles on this server."
}

module.exports.run = async (bot, msg, args) => {
	let allRoles = bot.guilds.get(bot.constants.BD4_ID).roles;

	// grab the main roles
	let mainRoles = allRoles.filter((role) => {
		return (role.permissions > 0 && !role.managed && role.name != "@everyone");
	});

	// sort the main roles
	mainRoles = mainRoles.sort((a,b) => {
		b.comparePositionTo(a);
	});

	// grab the player roles
	let playerRoles = allRoles.filter((role) => {
		return (role.permissions == 0 && !role.managed && role.mentionable);
	});

	// sort the player roles
	playerRoles = playerRoles.sort((a,b) => {
		if (a.name < b.name) return -1;
		if (a.name === b.name) return 0;
		if (a.name > b.name) return 1;
	});

	var roleInfo = new discord.RichEmbed()
		.addField("Main Roles", "test")
		.setThumbnail(bot.guilds.get(bot.constants.BD4_ID).iconURL)

	msg.channel.send(roleInfo);

	return true;
}
