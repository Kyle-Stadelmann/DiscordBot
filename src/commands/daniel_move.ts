import Constants from "../constants";
export const help = {
	commandName: "move",
	description: "Exclusive command for Daniel/Carter to send the other to AFK (where they RIGHTFULLY BELONG).",
	usage: `move`,
};

export const disabled = true;

export const run = async (bot, msg, args) => {
	let sender = msg.member;
	let victim;

	// If sender id isn't Daniel/Carters ID, ignore this event
	if (sender.id != Constants.DANIEL_ID && sender.id != Constants.CARTER_ID) {
		return false;
	}

	if (sender.id == Constants.DANIEL_ID) {
		victim = bot.guilds.get(Constants.BD4_ID).members.get(Constants.CARTER_ID);
	} else {
		victim = bot.guilds.get(Constants.BD4_ID).members.get(Constants.DANIEL_ID);
	}

	// If sender didn't send it to BOT_STUFF
	if (msg.channel.id != Constants.BOT_STUFF_CHANNEL_ID) {
		msg.delete();
		return false;
	}

	// If sender isnt in a channel
	if (sender.voiceChannel == null || sender.voiceChannel == Constants.AFK_CHANNEL_ID) {
		return false;
	}

	// Test if victim is in a channel or not
	if (victim.voiceChannel == null) {
		return false;
	}

	// Whether or not they were successful at moving the victim
	let success;

	if (bot.util.random(require("../events/event_percentages.js").DANIEL_SUCCESS_MOVE_CHANCE)) {
		// Put Victim into AFK channel
		victim.setVoiceChannel(Constants.AFK_CHANNEL_ID);
		console.log("Command was successful, victim was moved to AFK");
		success = true;
	} else {
		// Put Sender into AFK channel
		sender.setVoiceChannel(Constants.AFK_CHANNEL_ID);
		console.log("Command was successful, sender was moved to AFK");
		success = false;
	}

	// Send the correct "Goodbye message"

	let victimBeDaniel = true;
	if (victim.id === Constants.CARTER_ID) {
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
};
