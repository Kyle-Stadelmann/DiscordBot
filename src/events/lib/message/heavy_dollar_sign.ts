import Constants from "../../../constants";

module.exports = async (bot, message) => {
	if (bot.util.random(bot.event_percentages.HEAVY_DOLLAR_SIGN_CHANCE)) {
		message.react(Constants.HEAVY_DOLLAR_SIGN);
	}
};
