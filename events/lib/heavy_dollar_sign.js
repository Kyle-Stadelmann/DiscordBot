
module.exports = async (bot, message) => {

	if (bot.util.random(require("../event_percentages.js").HEAVY_DOLLAR_SIGN)) {
		message.react(":heavy_dollar_sign:");
	} 
}
