
module.exports = async (bot, member, speakingState) => {
    // member.id !== bot.constants.ASIAN_KYLE_ID <-- replace the true with this
    if (true && bot.util.random(bot.event_percentages.MUTE_CHANCE)) {
        member.edit({ mute: true });
    }
}