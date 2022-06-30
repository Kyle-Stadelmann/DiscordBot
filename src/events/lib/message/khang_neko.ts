import Constants from "../../../constants";

module.exports = async (bot, message) => {
	// Only continue if Khang sent the message
	if (message.author.id !== Constants.KHANG_ID) return;

	if (bot.util.random(bot.event_percentages.KHANG_NEKO_CHANCE)) {
		message.react(bot.emojis.cache.find((val) => val.name === Constants.KHANG_NEKO_EMOJI));
	}
};
