module.exports.help = {
    commandName: "ping",
    description: "Sends pong! for testing purposes.",
    usage: `ping`,
}
module.exports.dmAllow = true;
module.exports.disabled = false;

module.exports.run = async (bot, msg, args) => {
    msg.channel.send("pong!");
    return true;
}
