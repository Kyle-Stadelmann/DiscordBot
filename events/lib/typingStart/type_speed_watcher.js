module.exports = async (bot, typingState) => {
    if (bot.typingTimestamps.has(typingState.user.id) && bot.typingTimestamps.get(typingState.user.id) === null) {
        console.log("Watching: " + typingState.user.id);
        bot.typingTimestamps.set(typingState.user.id, typingState.startedTimestamp);
    }
}