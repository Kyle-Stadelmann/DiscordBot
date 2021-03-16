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
    cmdCollection.set(member.id, date.getTime());

    bot.util.writeDisk(bot.cooldowns, bot.constants.COOLDOWN_JSON_LOC);
}

// Check if we can take a command off cooldown
// Input: The discord client (contains cooldown collection), command name we
// are ending the cooldown of, the member that we are determining if they
// are on cooldown, and whether or not we want to force the end of the cooldown
// Output: Returns T/F, whether or not the command had its cooldown ended.
// (Also removes the command from the cooldown collection if returned true)
module.exports.tryEndCooldown = (bot, cmdName, member, forceEndCooldown = false) => {
    if (member == null) {
        // Member doesnt exist... no cooldown
        return true;
    }

    let cmdCooldownColl = bot.cooldowns.get(cmdName);
    if (cmdCooldownColl == null) {
        // There are no cooldowns for this command
        return true;
    }

    let cooldownTimer = cmdCooldownColl.get(member.id);
    if (cooldownTimer == null) {
        // Member is not on cooldown
        return true;
    }

    let coolTime = bot.constants.cooldownTimes.get(cmdName);
    if (coolTime == null) coolTime = 0;

    let date = new Date();
    if (cooldownTimer + coolTime <= date.getTime()) {
        cmdCooldownColl.delete(member.id);
        // since we actually deleted a cooldown, update the disk
        bot.util.writeDisk(bot.cooldowns, bot.constants.COOLDOWN_JSON_LOC);
        return true;
    }

    if (forceEndCooldown) {
        cmdCooldownColl.delete(member.id);
        // since we actually deleted a cooldown, update the disk
        bot.util.writeDisk(bot.cooldowns, bot.constants.COOLDOWN_JSON_LOC);
        return true;
    }

    // cooldown is not complete yet
    return false;
}

// Sets bot.cooldowns to either an empty collection or the collection stored on disk.
// Input: The discord client (contains cooldown collection)
module.exports.readDiskCooldowns = (bot) => {
    bot.util.readDisk(bot.constants.COOLDOWN_JSON_LOC, (err, data) => {
        bot.cooldowns = (err) ? new Discord.Collection() : data;
    });
}