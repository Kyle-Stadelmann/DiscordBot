
module.exports = async (bot, message) => {
	console.log("KhangNeko listener activated...");

	if (bot.util.random(require("../event_percentages.js").KHANG_NEKO_CHANCE)) {
		message.react(bot.emojis.find(val => val.name == "cat_thonk"));

		console.log("Event was triggered. Reacted to Khang's message");
	} else {
		console.log("Event was NOT triggered. Khang's message was untouched");
	}
}
