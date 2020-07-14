
module.exports = async (bot, message) => {
  if (bot.util.random(require("../event_percentages.js").DANIEL_WPM_CHANCE)) {
    let words = wordCount(message.content);

    message.channel.send("It took Daniel approximately " + howFast(bot, words) +
      " seconds to type that assuming he types at " +
      bot.constants.DANIEL_WPM + " words per minute.");
  }
}

function howFast(bot, wordCount) {
  return wordCount / bot.constants.DANIEL_WPM;
}

function wordCount(messageString) {
  // Theres probably a better way to do this than having it start at 1
  // Then you wouldn't need the empty string check (?)
  let wordCounter = 1;

  for (i = 0; i < messageString.length; i++) {
    if (messageString.charAt(i) === ' ') {
      wordCounter++;
    }
  }

  return wordCounter * 60;
}
