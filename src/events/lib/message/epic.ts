import Constants from "../../../constants";

module.exports = async (bot, message) => {
	//Reads "epic" from chat and reacts with sunglasses emoji
	if (
		message.content.toLowerCase().includes("epic") &&
		bot.util.random(bot.event_percentages.EPIC_SUNGLASSES_CHANCE)
	) {
		message.react(Constants.SUNGLASSES);
	}

	//Reads sunglasses emoji from chat and reacts with E, P, I, C
	if (
		message.content.includes(Constants.SUNGLASSES) &&
		bot.util.random(bot.event_percentages.SUNGLASSES_EPIC_CHANCE)
	) {
		message.react("🇪");
		message.react("🇵");
		message.react("🇮");
		message.react("🇨");
	}
};
