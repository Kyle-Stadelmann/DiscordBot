// Listener event: runs whenever a user changes voice state
// (mutes/unmutes, leaves channel, etc)
module.exports = async (bot, oldMember, newMember) => {
    bot.util.runEventLibs(bot, "voiceStateUpdate", [oldMember, newMember]);
};
