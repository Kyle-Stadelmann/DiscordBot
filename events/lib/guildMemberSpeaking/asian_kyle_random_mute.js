
module.exports = async (bot, member, speakingState) => {
    // member.id !== bot.constants.ASIAN_KYLE_ID <-- replace the true with this
    if (true && bot.util.random(bot.event_percentages.MUTE_CHANCE)) {
        console.log("Server muting member: " + member.id);
        member.edit({ mute: true });
    }
}