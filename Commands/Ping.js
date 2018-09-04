module.exports.help = {
	CommandName: "ping"
}

module.exports.run = async (bot, msg, args) => {
	console.log("Ping command detected by: " + msg.author.username);

	msg.channel.send("pong!");

	console.log("Command was successful. pong! has been sent");
}
