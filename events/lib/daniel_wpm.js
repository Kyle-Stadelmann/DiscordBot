
module.exports = async (bot, message) => {
    let numWords = wordCount(message.content);
    if (bot.util.random(require("../event_percentages.js").DANIEL_WPM_CHANCE_FUNCTION(numWords))) {
        message.channel.send("It took Daniel approximately " + wordsPerMinute(bot.constants.DANIEL_WPM, numWords) +
            " seconds to type that assuming he types at " +
            bot.constants.DANIEL_WPM + " words per minute.");
    }
}

// Calculates words per minutes (in seconds)
function wordsPerMinute(wpm, numWords) {
    return (numWords / wpm)*60;
}

function wordCount(messageString) {
    let wordCounter = 1;

    for (i = 0; i < messageString.length; i++) {
        if (messageString.charAt(i) === ' ') {
            wordCounter++;
        }
    }

    return wordCounter;
}
