randomCalc = require("../../util/random.js");

module.exports = async (bot, message) => {
	console.log("KhangNeko listener activated...");

	if (randomCalc(require("../EventPercentages.js").KHANG_NEKO_CHANCE)) {
		message.react(bot.emojis.find(val => val.name == "cat_thonk"));

		console.log("Event was triggered. Reacted to Khang's message");
		return;
	} else {
		console.log("Event was NOT triggered. Khang's message was untouched");
		return;
	}
}
