
module.exports = async (bot, oldMember, newMember) => {
  // Test to see if the post-change member is deafened
  console.log("AllenDeafenMove listener activated...");

  newMember.setVoiceChannel(bot.constants.AFK_CHANNEL_ID);

  console.log("Event was triggered. Allen was moved to AFK");
}
