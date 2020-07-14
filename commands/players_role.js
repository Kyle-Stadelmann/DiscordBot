module.exports.help = {
    commandName: "role",
    description: "Assigns 1 'players role.' Use the listRoles command to display the avaliable player roles.",
    usage: `role <player role without the Players part>`,
    example: "role CS:GO",
}

module.exports.disabled = true;

module.exports.run = async (bot, msg, args) => {
    if (args[0] == null) {
        msg.channel.send("No player role specified");
        return false;
    }

    let allRoles = bot.guilds.get(bot.constants.BD4_ID).roles;
    let targetRoleStr = args[0] + " players";
    let targetRole = allRoles.find(val => val.name.toLowerCase() === targetRoleStr);

    if (targetRole == null) {
        msg.channel.send("Incorrect player role specified");
        return false;
    }

    if (msg.member.roles.has(targetRole.id)) {
        msg.channel.send("You already have the player role specified");
        return false;
    }

    msg.member.addRoles(targetRole)
        .catch(console.error);

    msg.channel.send("You have been given the player role specified");
    return true;
}
