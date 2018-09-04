// Listener event: runs whenever the bot sends a ready event (when it first starts for example)
module.exports = async (bot) => {
	console.log("Bot starting up...");
    bot.printSpace();

	bot.user.setActivity("With Khang's Catgirls");
};
