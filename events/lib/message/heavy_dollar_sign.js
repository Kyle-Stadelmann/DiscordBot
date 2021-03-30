
module.exports = async (bot, message) => {
    if (bot.util.random(bot.event_percentages.HEAVY_DOLLAR_SIGN_CHANCE)) {
        message.react(bot.constants.HEAVY_DOLLAR_SIGN);
    }
}
