module.exports = async (bot, message) => {
    //Reads "epic" from chat and reacts with sunglasses emoji
    if(message.content.toLowerCase().includes("epic") && bot.util.random(require("../event_percentages.js").EPIC_SUNGLASSES_CHANCE)){
        message.react(bot.constants.SUNGLASSES);
    }

    //Reads sunglasses emoji from chat and reacts with E, P, I, C
    if(message.content.includes(bot.constants.SUNGLASSES) && bot.util.random(require("../event_percentages").SUNGLASSES_EPIC_CHANCE)){
        message.react('🇪');
        message.react('🇵');
        message.react('🇮');
        message.react('🇨');
    }
}