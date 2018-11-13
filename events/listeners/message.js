const discord = require('discord.js');

// Listener event: runs whenever a message is received
module.exports = async (bot, message) => {
	// Command processing
	if (message.content.indexOf(bot.constants.PREFIX) == 0) {
		if (message.author.bot) return;
    	if (message.channel.type === "dm") return;

		// Messsage is a command

		let messageArray = message.content.toLowerCase().split(" ");
		// Cmd String
		let cmdStr = messageArray[0].slice(bot.constants.PREFIX.length);
		// Args String array
		let args = messageArray.slice(1);

		// Grab actual command from collection
		let cmd = bot.commands.get(cmdStr);

		// test if the command actually exists
		if (cmd == null) return;

		// If help command was triggered
		if (args[0] != null && args[0].toLowerCase() === "help") {
			console.log(`Help for the ${cmd.help.commandName} command detected by: ${message.author.username}`);

			let helpStr = new discord.RichEmbed()
				.addField("Command", `\`${cmd.help.commandName}\``, true)
				.addField("Description", cmd.help.description)
				.addField("Usage", `\`${bot.constants.PREFIX}${cmd.help.usage}\``)
				.setColor(0x0)

			if (cmd.help.example != null) {
				helpStr.addField("Example", `\`${bot.constants.PREFIX}${cmd.help.example}\``);
			}

			message.channel.send(helpStr);
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
