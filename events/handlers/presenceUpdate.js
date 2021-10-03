// Listener event: runs whenever a guild member's presence (e.g. status, activity) is changed.
module.exports = async (bot, oldPresence, newPresence) => {
    // Run all the event libs (epic, khang_neko, zach_zacc, etc.)
    bot.util.runEventLibs(bot, "presenceUpdate", [oldPresence, newPresence]);
};
