
module.exports = async (bot, member, speakingState) => {
    if (member.id !== bot.constants.ASIAN_KYLE_ID ||
        member.voice.speaking !== true) {
        return;
    }
    member.edit({ deaf: true });
}