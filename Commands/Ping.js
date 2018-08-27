module.exports.help = {
	CommandName: "ping"
}

module.exports.run = async (bot, msg, args) => {
	console.log("Ping command detected by: " + msg.author.username);

	msg.channel.send("pong!");
}
