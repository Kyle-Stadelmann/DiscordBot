const discord = require('discord.js');

module.exports.help = {
	commandName: "scramble",
	description: "Sends everyone in your channel to a random channel.",
	usage: `scramble`,
}

module.exports.disabled = false;

module.exports.run = async (bot, msg, args) => {
	// voiceChannel that the author of the message is in
	let voiceChannel = msg.member.voice.channel;

	if (!voiceChannel) {
		msg.channel.send("Scramble failed because you are not in a valid voice channel!");
		return false;
	}

	let validChannels = new discord.Collection();

	// Gets all valid channels 
	// (that are voice, another channel than current, and that everyone can see)
	msg.guild.channels.cache.forEach(channel => {
		let perm = channel.permissionsFor(msg.guild.roles.everyone).has("VIEW_CHANNEL");
		if (channel.type === "voice" && channel.id !== voiceChannel.id && perm) {
			validChannels.set(channel.id, channel);
		}
	});

	// Test if there exists valid channels
	if (validChannels.array().length <= 0) {
		msg.channel.send("Scramble failed because there are not valid voice channels");
		return false;
	}

	msg.channel.send(`Initiating channel scramble on *${voiceChannel.name}*.`);

	// Collection of people in the message member's channel
	let channelMembers = voiceChannel.members;

	channelMembers.forEach(victim => {
		let randomChannel = validChannels.random();
		victim.edit({channel: randomChannel});
	});

	msg.channel.send("Channel scramble completed!");

	return true;
}
