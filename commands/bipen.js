module.exports.help = {
	commandName: "bipen",
	description: "Sends an important Bipen quote.",
	usage: `bipen`
}

module.exports.disabled = false;

module.exports.run = async (bot, msg, args) => {
	let message = "I'm a dragon Rob! ~ Bipen\nR.I.P. Bipen 08/2012";
	
	msg.channel.send(message);
	return true;
}
