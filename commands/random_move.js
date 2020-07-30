const discord = require('discord.js');

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
        msg.channel.send('Command was NOT successful, you must specify an admin on the server.');
        return false;
    }

    // If sender or victim isn't an admin, ignore this event
    if (!sender.hasPermission("ADMINISTRATOR") ||
        !victim.hasPermission("ADMINISTRATOR")) {
        msg.channel.send('Command was NOT successful, you or your victim are not an admin.');
        return false;
    }

    // If sender isnt in a channel
    if (sender.voice.channel == null ||
        sender.voice.channel == msg.guild.afkChannel.id) {

        msg.channel.send('Command was NOT successful, you must be in a non-AFK channel.');
        return false;
    }

	// Test if victim is in a channel or not
	if (victim.voice.channel == null) {

        msg.channel.send('Command was NOT successful, your victim isn\'t in a channel.');
        return false;
    }

    msg.channel.send('Initiating start of randomMove...')

	let validChannels = new discord.Collection();
	// Gets all valid channels 
	// (that are voice, another channel than current)
	msg.guild.channels.cache.forEach(channel => {
		if (channel.type === "voice" && channel.id !== victim.voice.channel.id) {
			validChannels.set(channel.id, channel);
		}
	});

	let chanceToMove = 100
	while (bot.util.random(chanceToMove)) {
		// sleep for 5 minutes
		await bot.util.sleep(5*60*1000);

		let randomChannel = validChannels.random();

        // Test if victim is still in a channel or not
        if (victim.voice.channel == null) {
            continue;
        }

        victim.edit({ channel: randomChannel });

        msg.channel.send(`${victim} has been banished!`);
        chanceToMove /= 2;
    }

    msg.channel.send(`Fear not ${victim}, your randomMove has completed.`)

    return true;
}
