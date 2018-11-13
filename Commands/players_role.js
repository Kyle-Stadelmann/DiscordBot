module.exports.help = {
	commandName: "role",
	description: "Assigns players roles. Use the listRoles command to display the avaliable player roles."
}

module.exports.run = async (bot, msg, args) => {
	let player = msg.mentions.roles.first;
	console.log(bot.roles.players.has(player.id));
}
