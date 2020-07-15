module.exports = async (bot, message) => {
    if(message.content.toLowerCase().includes("epic") && bot.util.random(require("../event_percentages.js").EPIC_SUNGLASSES_CHANCE)){
        message.react(bot.constants.SUNGLASSES);
    }
}