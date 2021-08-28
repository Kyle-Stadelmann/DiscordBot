import Constants from '../../../constants';

module.exports = async (bot, oldMember, newMember) => {
    // Test to see if the post-change member is deafened
    // Check if the members of this event were Allen
    if (oldMember.id !== Constants.ALLEN_ID ||
        newMember.id !== Constants.ALLEN_ID ||
        oldMember.voiceChannelID === Constants.AFK_CHANNEL_ID ||
        !newMember.selfDeaf ||
        !newMember.selfMute) {
            return;
    }
    console.log("AllenDeafenMove listener activated...");

    newMember.setVoiceChannel(Constants.AFK_CHANNEL_ID);

    console.log("Event was triggered. Allen was moved to AFK");
}
