
module.exports = async (bot, message) => {

    if (bot.util.random(require("../event_percentages.js").KHANG_NEKO_CHANCE)) {
        message.react(bot.emojis.cache.find(val => val.name === bot.constants.KHANG_NEKO_EMOJI));
    }
}
