const discord = require('discord.js');

export const help = {
    commandName: "scramble",
    description: "Sends everyone in your channel to a random channel.",
    usage: `scramble`,
}

export const disabled = false;

export const run = async (bot, msg, args) => {
    // voiceChannel that the author of the message is in
    let voiceChannel = msg.member.voice.channel;

    if (!voiceChannel || (msg.guild.afkChannel === voiceChannel)) {
        msg.channel.send("Scramble failed because you are not in a valid voice channel!");
        return false;
    }

    let validChannels = new discord.Collection();

	// Gets all valid channels 
	// (that are voice, another channel than current, that everyone can see, and that aren't afk)
	msg.guild.channels.cache.forEach(channel => {
        let notAfkChannel = msg.guild.afkChannel !== channel;
		let perm = channel.permissionsFor(msg.guild.roles.everyone).has("VIEW_CHANNEL");
		if (channel.type === "voice" && channel.id !== voiceChannel.id && perm && notAfkChannel) {
			validChannels.set(channel.id, channel);
		}
	});

    // Test if there exists valid channels
    if (validChannels.array().length === 0) {
        msg.channel.send("Scramble failed because there are no valid voice channels");
        return false;
    }

	msg.channel.send(`Initiating channel scramble on *${voiceChannel.name}*.`);

    // Collection of people in the message member's channel
    let channelMembers = voiceChannel.members;

    channelMembers.forEach(victim => {
        let randomChannel = validChannels.random();
        if (victim.voice.channel)
            victim.edit({ channel: randomChannel });
    });

    msg.channel.send("Channel scramble completed!");

    return true;
}
