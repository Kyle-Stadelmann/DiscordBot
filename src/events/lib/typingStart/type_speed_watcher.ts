import Constants from '../../../constants';

module.exports = async (bot, typingState) => {
    // Only watch people in the typingTimestamps collection
    if (!bot.typingTimestamps.has(typingState.user.id)) return;
    
    let timestamp = bot.typingTimestamps.get(typingState.user.id);
    if (timestamp === null || timestamp + Constants.TYPE_SPEED_RESET_TIME < new Date().getTime()) {
        console.log("Watching: " + typingState.user.id);
        bot.typingTimestamps.set(typingState.user.id, typingState.startedTimestamp);
    }
}