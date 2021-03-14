const Discord = require("discord.js");

// Add a command to cooldown
// Input: The discord client (contains cooldown collection), command name we
// are putting a cooldown on, and the member that we are putting on cooldown.
module.exports.cooldown = (bot, cmdName, member) => {
    if (member == null) {
        return;
    }

    // Check if this command doesn't have a member cooldown collection
    if (bot.cooldowns.get(cmdName) == null) {
        // Create and bind the member cooldown collection
        let coll = new Discord.Collection();
        bot.cooldowns.set(cmdName, coll);
    }

    cmdCollection = bot.cooldowns.get(cmdName);

    let date = new Date();
    cmdCollection.set(member, date.getTime());
}


// Check if we can take a command off cooldown
// Input: The discord client (contains cooldown collection), command name we
// are ending the cooldown of, the member that we are determining if they
// are on cooldown, and whether or not we want to force the end of the cooldown
// Output: Returns T/F, whether or not the command is on cooldown.
// (Also removes the command from the cooldown collection if returned true)
module.exports.tryEndCooldown = (bot, cmdName, member, forceEndCooldown = false) => {
    if (member == null) {
        // Member doesnt exist... no cooldown
        return true;
    }

    let memberCoolColl = bot.cooldowns.get(cmdName);
    if (memberCoolColl == null) {
        // There are no cooldowns for this command
        return true;
    }

    let cooldownTimer = memberCoolColl.get(member);
    if (cooldownTimer == null) {
        // Member is not on cooldown
        return true;
    }

    let coolTime = bot.constants.cooldownTimes.get(cmdName);
    if (coolTime == null) coolTime = 0;

    let date = new Date();
    if (cooldownTimer + coolTime <= date.getTime()) {
        memberCoolColl.delete(member);
        return true;
    }

    if (forceEndCooldown) {
        memberCoolColl.delete(member);
        return true;
    }

    // cooldown is not complete yet
    return false;
}
