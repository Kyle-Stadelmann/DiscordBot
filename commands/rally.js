const discord = require('discord.js');

module.exports.help = {
    commandName: "rally",
	description: "Brings all users connected to voice to the voice channel that the user is in.",
    usage: `rally`,
}

module.exports.disabled = false;

module.exports.run = async (bot, message, args) => {
    let voiceChannel = message.member.voice.channel; // User's voice channel
    let validChannels = new discord.Collection(); // List of channels that can be taken from
    let pullToHidden = false; // Pull to hidden channels or not
    let publicChannel = voiceChannel.permissionsFor(message.guild.roles.everyone).has("VIEW_CHANNEL"); // Whether or not user's channel is public
    let rolesToCall = message.mentions.roles; // Role getting pulled

    // Rally to me! (pull into a non-public channel)
    if (args[0] === "to" && args[1] === "me") {
        pullToHidden = true;
    } 

    // Check if called from valid voice channel
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

    // Check for a valid channel
    if (validChannels.array().length <= 0) {
        message.channel.send("Rally failed because there are no valid voice channels.");
        return false;
    }

    // Check for a valid member (rally is successful as long as there is one member in one valid channel)
    let areValidMembers = !(validChannels.some(vChannel => {
        return vChannel.members.some(member => {
            if(rolesToCall.size === 0) return true;

            return rolesToCall.some(membRole => {
                return member.roles.cache.has(membRole.id);
            });
        });
    }));
    if(areValidMembers) {
        message.channel.send("Rally failed because there are no users to Rally with. Nice solo ult...");
        return false;
    }

    // Don't broadcast if target channel is hidden
    if (!pullToHidden) {
        message.channel.send(`Initiating rally on ${voiceChannel.name}.`);
    }

    // Move all valid users to caller's voice channel
    validChannels.forEach(userChannel => {
        userChannel.members.forEach(member => {
            // kyle made this logic and he is a GENIUS (actually mindblowing)
            // size of roles list && whether any entry in roles list overlaps with user's roles
            if (!((rolesToCall.size > 0) && !rolesToCall.some(userRole => member.roles.cache.has(userRole.id)))) {
                console.log("Moving user with ID: " + member.id);
                member.edit({channel: message.member.voice.channel})
                    .catch((error) => {
                        console.error(error);
                    });
                }
            });
    });

    // yay
    message.channel.send("Rally completed!");

    return true;
}