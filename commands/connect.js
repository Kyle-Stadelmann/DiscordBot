const discord = require('discord.js');

module.exports.help = {
    commandName: "connect",
	description: "BD4 Bot connects to the user's voice channel",
    usage: `connect`,
}

module.exports.disabled = false;

module.exports.run = async (bot, message, args) => {
    // NOTICE: The case where this command is sent through a DM is not handled
    // I'm also not sure if the bot will disconnect on its own after a certain 
    // amount of time, but if not that needs to be implemented

    // User's voice channel
    let voiceChannel = message.member.voice.channel;
    
    // Error checking
    if(!voiceChannel ||
        voiceChannel === message.guild.afkChannel) {
            message.channel.send("You are not connected to a valid voice channel!");
            return false;
    }
    
    message.channel.send(`Connecting to ${voiceChannel.name}`);
    message.member.voice.channel.join();

    return true;
}