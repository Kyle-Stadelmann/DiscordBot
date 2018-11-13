module.exports.help = {
	commandName: "role",
	description: "Assigns 1 'players role.' Use the listRoles command to display the avaliable player roles."
}

module.exports.run = async (bot, msg, args) => {
	if (args)
	console.log(bot.roles.players.has(player.id));
}
