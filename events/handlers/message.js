const discord = require('discord.js');

// Listener event: runs whenever a message is received
module.exports = async (bot, message) => {
	// Command processing
	if (message.content.indexOf(bot.constants.PREFIX) == 0) {
		if (message.author.bot) return;
    	if (message.channel.type === "dm") return;

		// Messsage is a command, continue to parse cmd

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

			let helpStr = new discord.MessageEmbed()
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


		// Check if cooldown is over
		if (!bot.util.endCooldown(bot, cmdStr, message.member)) {
			console.log("Command was NOT successful, member is on cooldown.")
			message.channel.send("Command was NOT successful, you are on cooldown for this command.");
			bot.printSpace();
			return;
		}

		bot.util.cooldown(bot, cmdStr, message.member);
    	// Command handling
    	if (cmd) {
			if (await cmd.run(bot, message, args)) {
				console.log("Command was successful.");
			} else {
				console.log("Command was NOT successful.");
				bot.util.endCooldown(bot, cmdStr, message.member, true);
			}
			bot.printSpace();
		}
	}

	// KhangNeko RandomEvent
	if (message.author.id === bot.constants.KHANG_ID) {
		require("../lib/khang_neko.js")(bot, message);
	}

	// DanielWPM Call
	if (message.author.id === bot.constants.DANIEL_ID) {
		require("../lib/daniel_wpm.js")(bot, message);
	}
};
