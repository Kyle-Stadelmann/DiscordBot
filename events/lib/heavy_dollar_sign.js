
module.exports = async (bot, message) => {
    if (bot.util.random(require("../event_percentages.js").HEAVY_DOLLAR_SIGN_CHANCE)) {
        message.react(bot.constants.HEAVY_DOLLAR_SIGN);
    }
}
