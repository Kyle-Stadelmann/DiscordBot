import Constants from "../constants";

export const help = {
	commandName: "sword",
	description:
		"Exclusive command to Zach. Once a week he can begin sharpening his sword. He can sharpen it for up to a week before attempting to annihilate someone. The longer the sharpening time, the higher the potency!",
	usage: `sword @victim`,
	examples: ["sword @Dualkim"],
};

export const disabled = true;

var sharpeningDate = null;
export const run = async (bot, msg, args) => {
	let sender = msg.member;
	let victim = msg.mentions.members.first();

	let date = new Date();

	// make sure user of command is zach
	if (sender.id !== Constants.ZACH_ID) {
		msg.channel.send("Command was NOT successful, only zach can sharpen his sword.");
		return false;
	}

	// begin sharpening sword
	if (victim == null) {
		if (sharpeningDate !== null) {
			msg.channel.send("Command was NOT successful, you are already sharpening your sword.");
			return false;
		}

		msg.channel.send("You have begun sharpening your dull sword.");
		// end zachs cooldown so he can slay someone eventually
		// TODO: TypeScript migration. This was never implemented.
		bot.util.tryEndCooldown(bot, "sword", sender, true);

		sharpeningDate = date.getTime();

		return true;
	}

	// make sure he sharpened for enough time
	if (sharpeningDate == null || sharpeningDate + Constants.MIN_SHARPEN_TIME > date.getTime()) {
		msg.channel.send("Command was NOT successful, your sword is too dull!");
		return false;
	}

	if (!victim.kickable || victim.id == Constants.BD4_BOT_ID) {
		msg.channel.send("Command was NOT successful, you fear your victim's strength completely eclipses yours.");
		return false;
	}

	return true;
};
