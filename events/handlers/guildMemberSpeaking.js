// Listener event: runs whenever a user starts/stops speaking 
// (Bot MUST be in call in order to receive this data)
/* (I'm not sure at all how to use speakingState, but I'll leave 
it in the signature because it's probably used for something) */
module.exports = async (bot, member, speakingState) => {

    // Check if speaker is Asian Kyle
    if (member.id === bot.constants.ASIAN_KYLE_ID &&
        member.voice.speaking === true) {
        require("../lib/asian_kyle_random_mute.js")(bot, member);
    }
}