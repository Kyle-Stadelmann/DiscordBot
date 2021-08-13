// Listener event: runs whenever the bot detects someone starting to type
module.exports = async (bot, typingState) => {
    // Run all the event libs (epic, khang_neko, zach_zacc, etc.)
    bot.util.runEventLibs(bot, "typingStart", [typingState]);
};
