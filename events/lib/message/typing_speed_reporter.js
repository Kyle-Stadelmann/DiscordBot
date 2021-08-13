module.exports = async (bot, message) => {
    // bot.event_percentages.DANIEL_WPM_CHANCE_FUNCTION(numWords) <-- replace the true with this
    if (true && bot.typingTimestamps.has(message.author.id) && bot.typingTimestamps.get(message.author.id)) {
        let typingTime = message.createdTimestamp - bot.typingTimestamps.get(message.author.id);

        console.log("Reporting a typing time of: " + typingTime/1000 + " for user: " + message.author.id);
        message.channel.send("That message took approximately " + typingTime/1000 + " seconds");
        bot.typingTimestamps.set(message.author.id, null);

        bot.printSpace();
    }
}