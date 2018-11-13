module.exports.help = {
	commandName: "ping",
	description: "Sends pong! for testing purposes."
}

module.exports.run = async (bot, msg, args) => {
	msg.channel.send("pong!");

	return true;
}
