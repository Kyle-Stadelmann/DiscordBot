const Discord = require("discord.js");

// Add a command to cooldown
// Input: The discord client (contains cooldown collection), command name we
// are putting a cooldown on, and the member that we are putting on cooldown.
module.exports.activateCooldown = (bot, cmdName, member) => {
    if (!member) return;

    // If command doesn't have a cooldown, return early
    if (!bot.constants.cooldownTimes.has(cmdName)) return;

    // Check if this command doesn't have a member cooldown collection
    if (bot.cooldowns.get(cmdName) == null) {
        // Create and bind the member cooldown collection
        let coll = new Discord.Collection();
        bot.cooldowns.set(cmdName, coll);
    }

    let cmdCollection = bot.cooldowns.get(cmdName);

    let date = new Date();
    cmdCollection.set(member.id, date.getTime());

    // Write the cooldowns out to disk in order to persist them
    bot.util.writeDisk(bot, bot.cooldowns, bot.constants.COOLDOWN_JSON_LOC);
}

// Take a command off cooldown
// Input: The discord client (contains cooldown collection), command name we
// are ending the cooldown of, the member that we are determining if they
// are on cooldown.
module.exports.endCooldown = (bot, cmdName, member) => {
    // If member doesn't exist... no cooldown
    if (!member) return;

    let cmdCooldownColl = bot.cooldowns.get(cmdName);
    // Test if there are no cooldowns active for this command
    if (!cmdCooldownColl) return;

    let cooldownTimer = cmdCooldownColl.get(member.id);
    // Test if member isn't on cooldown
    if (!cooldownTimer) return;

    cmdCooldownColl.delete(member.id);
    // since we deleted a cooldown, update the disk
    bot.util.writeDisk(bot, bot.cooldowns, bot.constants.COOLDOWN_JSON_LOC);
}

// Check if a member is on cooldown
// Input: The discord client (contains cooldown collection), command name we
// are ending the cooldown of, the member that we are determining if they
// are on cooldown.
// Output: Returns T/F, whether the command is on cooldown or not
module.exports.isOnCooldown = (bot, cmdName, member) => {
    // If member doesn't exist... no cooldown
    if (!member) return false;
    
    let cmdCooldownColl = bot.cooldowns.get(cmdName);
    // Test if there are no cooldowns active for this command
    if (!cmdCooldownColl) return false;

    let cooldownTimer = cmdCooldownColl.get(member.id);
    // Test if member isn't on cooldown
    if (!cooldownTimer) return false;

    let coolTime = bot.constants.cooldownTimes.get(cmdName);
    if (!coolTime) coolTime = 0;

    let date = new Date();
    if (cooldownTimer + coolTime > date.getTime()) {
        // Cooldown is still active
        return true;
    } else {
        // Cooldown is not active anymore
        return false;
    }
}

// Sets bot.cooldowns to either an empty collection or the collection stored on disk.
// Input: The discord client (contains cooldown collection)
module.exports.readDiskCooldowns = (bot) => {
    bot.util.readDisk(bot, bot.constants.COOLDOWN_JSON_LOC, (err, data) => {
        // We had an issue while reading JSON (json.parse throws SyntaxError), print error
        if (err instanceof SyntaxError) console.error(err);

        bot.cooldowns = (err) ? new Discord.Collection() : data;
    });
}