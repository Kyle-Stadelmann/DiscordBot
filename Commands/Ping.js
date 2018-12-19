module.exports.help = {
	commandName: "ping",
	description: "Sends pong! for testing purposes.",
	usage: `ping`
}

module.exports.run = async (bot, msg, args) => {
	msg.channel.send("pong!");
	bot.util.endCooldown(bot, "move", null);
	return true;
}
