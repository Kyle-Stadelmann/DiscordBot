// Bot prefix
const prefix = ">";

// Listener event: runs whenever a message is received
module.exports = async (bot, message) => {
	// Command processing
	if (message.content.indexOf(prefix) == 0) {
		if (message.author.bot) return;
    	if (message.channel.type === "dm") return;

		// Messsage is a command

		let messageArray = message.content.toLowerCase().split(" ");
		// Cmd String
		let cmdStr = messageArray[0].slice(prefix.length);
		// Args String array
		let args = messageArray.slice(1);

		// Grab actual command from collection
		let cmd = bot.commands.get(cmdStr);

		// test if the command actually exists
		if (cmd == null) return;

		// If help command was triggered
		if (args[0] != null && args[0].toLowerCase() === "help") {
			console.log(`Help ${cmd.help.commandName} detected by: ${message.author.username}`);

			let output = `${cmd.help.commandName} Command Description: ${cmd.help.description}`;

			message.channel.send(`${output}`);
			console.log("Help was successful.");
			bot.printSpace();
			return;
		}

		console.log(`${cmd.help.commandName} command detected by: ${message.author.username}`);

    	// Command handling
    	if (cmd) {
			if (await cmd.run(bot, message, args)) {
				console.log("Command was successful.")
			} else {
				console.log("Command was NOT successful.")
			}
			bot.printSpace();
		}
	}

	// KhangNeko RandomEvent
	if (message.author.id == bot.constants.KHANG_ID) {
		require("../lib/khang_neko.js")(bot, message);
		bot.printSpace();
	}
};
