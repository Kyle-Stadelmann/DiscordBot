module.exports.help = {
    commandName: "whip",
    description: "Brigitte lends you her flail to hit your target a large amount of channels down",
    usage: `whip @user`,
}

module.exports.disabled = false;

module.exports.run = async (bot, msg, args) => {
    let sender = msg.member;
    let victim = msg.mentions.members.first();

    if (victim == null) {
        msg.channel.send('Command was NOT successful, you must specify an victim.');
        return false;
    }

    // If sender isn't an admin, ignore this event
    if (!sender.hasPermission("ADMINISTRATOR")) {
        msg.channel.send('Command was NOT successful, Brigitte only lends her flail to admins.');
        return false;
    }

    if (sender.voice.channel == null || sender.voice.channelID !== victim.voice.channelID) {
        msg.channel.send('Command was NOT successful, your target isn\'t close enough (not in the same voice channel as you)');
        return false;
    }

    // number of channels to move the user
    let numChannels = bot.constants.NUM_CHANNELS_WHIPPED;
    // the raw position in the guild of the victim's voice channel
    let currPos = victim.voice.channel.position;

    // voice channels iterator in order of position
    let voiceChannels = msg.guild.channels.cache
        .filter(channel => {
            let notAfkChannel = msg.guild.afkChannel !== channel;
            let visibleToAll = channel.permissionsFor(msg.guild.roles.everyone).has("VIEW_CHANNEL");

            // filter out channels that arent voice channels, have lower position,
            // are afk channels, or are hidden channels
            return channel.type === "voice" && channel.position > currPos && notAfkChannel && visibleToAll;
        })
        .sort((ch1, ch2) => ch1.position - ch2.position)
        .values();

    let tempChannels = [];
    let currTempChannel = null;

    // move them numChannels down
    for (let i=0; i<numChannels; i++) {
        // Next channel to move victim to is the next available channel below current one in guild
        let nextIterator = voiceChannels.next(); 
        let nextChannel = nextIterator.value;

        // if there are no avilable channels, create a new one
        if (nextIterator.done) {
            if (currTempChannel) tempChannels.push(currTempChannel);
            
            // check to make sure victim hasn't left channel while moving was happening
            if (victim.voice.channel === null) break;

            // clone the channel that the user is currently in
            currTempChannel = await victim.voice.channel.clone({ name: "rekt" });
            nextChannel = currTempChannel;
        }

        // check to make sure victim hasn't left channel while moving was happening
        if (victim.voice.channel === null) break;

        await victim.voice.setChannel(nextChannel);
    }

    // delete tempChannels
    tempChannels.forEach(channel => channel.delete());

    // Check if we have to delete temp channel when victim leaves channel
    if (currTempChannel) {
        // The max number of iterations we'll check for if the user left the channel
        // after this amount, we will just delete the channel with the user in it
        const MAX_ITERATIONS_TO_WAIT = 600;
        // current number of iterations waited
        let numIterationsWaited = 0;

        while (victim.voice.channelID === currTempChannel.id && numIterationsWaited < MAX_ITERATIONS_TO_WAIT) {
            numIterationsWaited++;

            await bot.util.sleep(100);
        }

        // delete the last temp channel that the user used to be in
        currTempChannel.delete();
    }
    return true;
}
