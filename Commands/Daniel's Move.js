module.exports.help = {
    CommandName: "move"
}

module.exports.run = async (bot, msg, args) => {
	// First mention from author
	let mention = null;
    mention = msg.mentions.members.first();

	if (mention == null) {
		console.log("Daniel's move command detected, however command was unsuccessful because there was no target");
		return;
	}

	console.log("Daniel's move command detected on: " + mention.user.username + ", by: " + msg.author.username);

	// If memeber id isn't Daniel's ID, ignore this event
	if (msg.author.id != bot.constants.DANIEL_ID) {
		console.log("Command was unsuccessful. Member wasn't Daniel");
		return;
	}

	// If daniel didn't send it to BOT_STUFF
	if (msg.channel.id != bot.constants.BOT_STUFF_CHANNEL_ID) {
		console.log("Command was unsuccessful. Typed it into the wrong chat")
		msg.delete();
		msg.author.setVoiceChannel(bot.constants.AFK_CHANNEL_ID);
		return;
	}

	// If memeber id isn't Carter's ID, ignore this event
	if (mention.id != bot.constants.CARTER_ID) {
		console.log("Command was unsuccessful. Daniel tried to move someone other than Carter");
		return;
	}

	// Test if carter is in a channel or not
	if (mention.voiceChannel == null) {
		console.log("Command was unsuccessful. Carter isn't in a channel");
		return;
	}

	// Put carter into AFK channel
	mention.setVoiceChannel(bot.constants.AFK_CHANNEL_ID);

	console.log("Command was successful, Carter was moved to AFK");
	msg.channel.send("Goodbye Carter");
}
