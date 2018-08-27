var constants = require('../constants.js');

module.exports.help = {
    CommandName: "move"
}

module.exports.run = async (bot, msg, args) => {

	// First mention from author
    let mention = msg.mentions.members.first();

	console.log("Daniel's move command detected on: " + mention.user.username + ", by: " + msg.author.username);

	// If memeber id isn't Daniel's ID, ignore this event
	if (msg.author.id != constants.DANIEL_ID) {
		console.log("Command was unsuccessful. Member wasn't Daniel");
		return;
	}

	// If memeber id isn't Carter's ID, ignore this event
	if (mention.id != constants.CARTER_ID) {
		console.log("Command was unsuccessful. Daniel tried to move someone other than Carter");
		return;
	}

	// Test if carter is in a channel or not
	if (mention.voiceChannel == null) {
		console.log("Command was unsuccessful. Carter isn't in a channel");
		return;
	}

	// Put carter into AFK channel
	mention.setVoiceChannel(constants.AFK_CHANNEL_ID);

	console.log("Command was successful, Carter was moved to AFK");
	message.channel.send("Goodbye Carter");
}
