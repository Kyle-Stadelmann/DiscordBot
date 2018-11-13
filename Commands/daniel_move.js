module.exports.help = {
    commandName: "move",
	description: "Moves Daniel/Carter to AFK where they RIGHTFULLY BELONG."
}

module.exports.run = async (bot, msg, args) => {
	let sender = msg.member;
	let victim;

	// If sender id isn't Daniel/Carters ID, ignore this event
	if (sender.id != bot.constants.DANIEL_ID &&
		sender.id != bot.constants.CARTER_ID) {

		return false;
	}

	if (sender.id == bot.constants.DANIEL_ID) {
		victim = bot.guilds.get(bot.constants.BD4_ID).members.get(bot.constants.CARTER_ID);
	} else {
		victim = bot.guilds.get(bot.constants.BD4_ID).members.get(bot.constants.DANIEL_ID);
	}

	// If sender didn't send it to BOT_STUFF
	if (msg.channel.id != bot.constants.BOT_STUFF_CHANNEL_ID) {
		msg.delete();
		return false;
	}

	// If sender isnt in a channel
	if (sender.voiceChannel == null ||
		sender.voiceChannel == bot.constants.AFK_CHANNEL_ID) {

		return false;
	}

	// Test if victim is in a channel or not
	if (victim.voiceChannel == null) {
		return false;
	}

	// Whether or not they were successful at moving the victim
	let success = true;

	if (bot.util.random(require("../events/event_percentages.js").DANIEL_SUCCESS_MOVE_CHANCE)) {
		// Put Victim into AFK channel
		victim.setVoiceChannel(bot.constants.AFK_CHANNEL_ID);
		console.log("Command was successful, victim was moved to AFK");
		success = true;
	} else {
		// Put Sender into AFK channel
		sender.setVoiceChannel(bot.constants.AFK_CHANNEL_ID);
		console.log("Command was successful, sender was moved to AFK");
	}

	// Send the correct "Goodbye message"

	let victimBeDaniel = true;
	if (victim.user.username == bot.constants.CARTER_ID) {
		victimBeDaniel = false;
	}

	if (success) {
		if (victimBeDaniel) {
			msg.channel.send("Goodbye Daniel");
		} else {
			msg.channel.send("Goodbye Carter");
		}
	} else {
		if (victimBeDaniel) {
			msg.channel.send("Goodbye Carter");
		} else {
			msg.channel.send("Goodbye Daniel");
		}
	}
	return true;
}
