module.exports.help = {
    commandName: "randommove",
	description: "Exclusive command for admins that moves another admin to a random channel every 5 minutes for a random amount of time.",
	usage: `randomMove @admin`,
	example: "randomMove @Dualkim",
}

module.exports.disabled = false;

module.exports.run = async (bot, msg, args) => {
	let sender = msg.member;
	let victim = msg.mentions.members.first();

	if (victim == null) {
		return false;
	}

	// If sender or victim isn't an admin, ignore this event
	if (!sender.hasPermission("ADMINISTRATOR") ||
		!victim.hasPermission("ADMINISTRATOR")) {
		return false;
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

	let chanceToMove = 100
	while (bot.util.random(chanceToMove)) {
		// sleep for 5 minutes
		await bot.util.sleep(300000);

		let randomChannel;
		do {
			randomChannel = bot.guilds.get(bot.constants.BD4_ID).channels.random();
		} while (randomChannel.type !== "voice" && randomChannel !== victim.voiceChannel);

		// Test if victim is still in a channel or not
		if (victim.voiceChannel == null) {
			continue;
		}

		victim.setVoiceChannel(randomChannel);

		msg.channel.send(`${victim} has been banished!`);
		chanceToMove /= 2;
	}

	return true;
}
