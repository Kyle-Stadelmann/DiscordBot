module.exports = async (bot, message) => {
    // Only continue if Daniel sent the message
    if (message.author.id !== bot.constants.DANIEL_ID) return;

    // Reads variations of "thank you bot" from daniel in chat and replys with "you're welcome dualkim"
    if (message.content.toLowerCase().includes("thank") && message.content.toLowerCase().includes("bot")) {
        message.channel.send("You're welcome DualKim! :)");
    }
    
    // Reads daniels complaint from chat, replys to  dualkim, telling him i'm just doing my job
    if (message.content.toLowerCase().includes("fuck") && message.content.toLowerCase().includes("bot")) {
	    message.channel.send("I'm just doing my job DualKim >:(");
    }
}
