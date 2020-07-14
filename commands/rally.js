const discord = require('discord.js');

module.exports.help = {
    commandName: "rally",
	description: "Brings all users connected to voice to the voice channel that the user is in.",
	usage: `rally`,
}

module.exports.disabled = false;

module.exports.run = async (bot, message, args) => {
    let voiceChannel = message.member.voice.channel;
    let validChannels = new discord.Collection();
    let memberCounter = 0;
    let pullToHidden = false;
    let publicChannel = voiceChannel.permissionsFor(message.guild.roles.everyone).has("VIEW_CHANNEL");

    if (args[0] === "to" && args[1] === "me") {
        pullToHidden = true;
    } 

    if (!voiceChannel || voiceChannel === message.guild.afkChannel || 
        (!publicChannel && !pullToHidden)) {
		message.channel.send("Rally failed because you are not in a valid voice channel! Brigitte would be sad...");
		return false;
    }

    // Go through each voice channel and establish whether or not it's valid
    message.guild.channels.cache.forEach(userChannel => {
        let perm = userChannel.permissionsFor(message.guild.roles.everyone).has("VIEW_CHANNEL");
        if (!(message.guild.afkChannel &&
            userChannel.id === message.guild.afkChannel.id) && 
            userChannel.id !== message.member.voice.channel.id &&
            userChannel.type === "voice" && perm) {
                validChannels.set(userChannel.id, userChannel);
        }
    });

    // Invalid rally checks
    if (validChannels.array().length <= 0) {
        message.channel.send("Rally failed because there are no valid voice channels.");
        return false;
    }

    validChannels.forEach(vChannel => {
        vChannel.members.forEach(validMember => {
            memberCounter++;
        });
    });
    if (memberCounter <= 0) {
        message.channel.send("Rally failed because there are no users to Rally with. Nice solo ult...");
        return false;
    }

    if (!pullToHidden) {
        message.channel.send(`Initiating rally on ${voiceChannel.name}.`);
    }

    // Move all valid users to caller's voice channel
    validChannels.forEach(userChannel => {
    userChannel.members.forEach(member => {
        console.log("Moving user with ID: " + member.id);
        member.edit({channel: message.member.voice.channel})
            .catch((error) => {
                console.error(error);
            });
        });
    });

    message.channel.send("Rally completed!");

    return true;
}