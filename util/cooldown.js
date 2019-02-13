const Discord = require("discord.js");

// Add a command to cooldown
// Input: The discord client (contains cooldown collection), command name we
// are putting a cooldown on, and the member that we are putting on cooldown.
module.exports.cooldown = (bot, cmdName, member) => {
	if (member == null) {
		return;
	}

	// Check if this command doesn't have a member cooldown collection
	if (bot.cooldowns.get(cmdName) == null) {
		// Create and bind the member cooldown collection
		let coll = new Discord.Collection();
		bot.cooldowns.set(cmdName, coll);
	}

	cmdCollection = bot.cooldowns.get(cmdName);

	let date = new Date();
	cmdCollection.set(member, date.getTime());
}
