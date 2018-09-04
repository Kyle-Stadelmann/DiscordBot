// Bot prefix
const prefix = ">";

// Listener event: runs whenever a message is received
module.exports = async (bot, message) => {

	// Return if non-command
	if (message.content.indexOf(prefix) !== 0) return;
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

    // Command handling
    if (cmd) {
		cmd.run(bot, message, args);
		bot.printSpace();
	}
};
