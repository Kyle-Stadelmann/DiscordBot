import Constants from "../../../constants";

module.exports = async (bot, message) => {
	// Only continue if Daniel sent the message
	if (message.author.id !== Constants.DANIEL_ID) return;
	// ignore commands for this event
	if (message.content.startsWith(Constants.PREFIX)) return;

	let numWords = wordCount(message.content);
	if (bot.util.random(bot.event_percentages.DANIEL_WPM_CHANCE_FUNCTION(numWords))) {
		message.channel.send(
			"It took Daniel approximately " +
				wordsPerMinute(Constants.DANIEL_WPM, numWords) +
				" seconds to type that assuming he types at " +
				Constants.DANIEL_WPM +
				" words per minute."
		);
	}
};

// Calculates words per minutes (in seconds)
function wordsPerMinute(wpm, numWords) {
	return (numWords / wpm) * 60;
}

function wordCount(messageString) {
	let wordCounter = 1;

	for (let i = 0; i < messageString.length; i++) {
		if (messageString.charAt(i) === " ") {
			wordCounter++;
		}
	}

	return wordCounter;
}
