export const help = {
    commandName: "ping",
    description: "Sends pong! for testing purposes.",
    usage: `ping`,
}
export const dmAllow = true;
export const disabled = false;

export const run = async (bot, msg, args) => {
    msg.channel.send("pong!");
    return true;
}
