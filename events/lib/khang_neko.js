
module.exports = async (bot, message) => {

	if (bot.util.random(require("../event_percentages.js").KHANG_NEKO_CHANCE)) {
		message.react(bot.emojis.find(val => val.name == "cat_thonk"));
	} 
}
