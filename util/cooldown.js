const Discord = require("discord.js");

// Add a command to cooldown
// Input: The discord client (contains cooldown collection), command name we
// are putting a cooldown on, and the member that we are putting on cooldown.
module.exports.cooldown = async (bot, cmdName, member) => {
	// Check if this command doesn't have a cooldown collection
	if (bot.cooldown.get(cmdName) == null) {
		let coll = new Discord.Collection();
		bot.cooldown.set(cmdName, coll);
	}

	cmdCollection = bot.cooldown.get(cmdName);


	cmdCollection.set(member, new Date());
}
