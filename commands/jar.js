module.exports.help = {
    commandName: "jar",
    description: "",
    usage: `jar [Action] [Category]`,
    example: `jar add "Kyle's movies"`
}

module.exports.disabled = true;

module.exports.run = async (bot, msg, args) => {
    msg.channel.send("pong!");
    return true;
}
