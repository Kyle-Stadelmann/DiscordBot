function countWords(str) {
    return (str) ? str.trim().split(/\s+/).length : 0;
}

module.exports = async (bot, message) => {
    if (!bot.typingTimestamps.has(message.author.id) || !bot.typingTimestamps.get(message.author.id)) return;

    let wordCount = countWords(message.content);
    if (wordCount == 0) return;

    if (bot.util.random(bot.event_percentages.DANIEL_WPM_CHANCE_FUNCTION(wordCount))) {
        // Time spent typing message in seconds
        let typingTime = (message.createdTimestamp - bot.typingTimestamps.get(message.author.id))/1000;
        let wpm = (wordCount / typingTime) * 60;

        console.log(`Reporting a typing time of: ${typingTime} with WPM of ${wpm} for user: ${message.author.id}`);
        message.channel.send(`That message took approximately ${typingTime} seconds, with a WPM of ${wpm}`);
        bot.typingTimestamps.set(message.author.id, null);

        bot.printSpace();
    }
}