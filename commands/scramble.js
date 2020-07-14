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

	msg.channel.send(`Initiating channel scramble on ${voiceChannel.name}.`);

	// Collection of people in the message member's channel
	let channelMembers = voiceChannel.members;

	channelMembers.forEach(victim => {
		let randomChannel;
		do {
			randomChannel = msg.guild.channels.cache.random();
			// Keep generating random channels if its not a voicechannel, or the channel they're 
			// already in, or if not everyone has permission to view that channel
		} while (randomChannel.type !== "voice" || randomChannel.id === voiceChannel.id 
			|| randomChannel.permissionsFor(msg.guild.roles.everyone).VIEW_CHANNEL);

		victim.edit({channel: randomChannel});
	});

	msg.channel.send("Channel scramble completed!");

	return true;
}
