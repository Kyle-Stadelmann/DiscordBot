// Listener event: runs whenever a user changes voice state
// (mutes/unmutes, leaves channel, etc)
module.exports = async (bot, oldMember, newMember) => {
	// Check if the members of this event were Allen
	if (oldMember.id == bot.constants.ALLEN_ID &&
		newMember.id == bot.constants.ALLEN_ID) {
		require("../lib/AllenDeafenMove.js")(bot, oldMember, newMember)
	}
};
