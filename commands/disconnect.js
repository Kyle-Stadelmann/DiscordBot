const discord = require('discord.js');

module.exports.help = {
    commandName: "disconnect",
	description: "BD4 Bot disconnects from its current voice channel.",
    usage: `disconnect`,
}

module.exports.disabled = false;

module.exports.run = async (bot, message, args) => {
    // NOTICE: The case where this command is sent through a DM is not handled

    // Bot's voice channel
    let botChannel = message.guild.voice.channel;
    
    // Error checking
    if(!botChannel) {
            message.channel.send("I am not currently connected to a voice channel!");
            return false;
    }
      
    message.guild.voice.channel.leave();
    message.channel.send("Successfully disconnected!");

    return true;
}