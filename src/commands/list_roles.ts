import { MessageEmbed } from 'discord.js';
import Constants from '../constants';

export const help = {
    commandName: "listroles",
    description: "Lists the 'main' and 'player' roles on the BD4 server.",
    usage: `listRoles`,
}

export const disabled = true;

export const run = async (bot, msg, args) => {
    let allRoles = bot.guilds.get(Constants.BD4_ID).roles;

    // grab the main roles
    let mainRoles = allRoles.filter((role) => {
        return (role.permissions > 0 && !role.managed && role.name != "@everyone");
    });

    // sort the main roles
    mainRoles = mainRoles.sort((a, b) => {
        return b.comparePositionTo(a);
    });

    // grab the player roles
    let playerRoles = allRoles.filter((role) => {
        return (role.permissions == 0 && !role.managed && role.mentionable);
    });

    // sort the player roles
    playerRoles = playerRoles.sort((a, b) => {
        if (a.name < b.name) return -1;
        if (a.name === b.name) return 0;
        if (a.name > b.name) return 1;
    });

    let mainRoleStr = "";
    mainRoles.forEach((value, key, collection) => {
        mainRoleStr += value.name;
        mainRoleStr += "\n";
    });

    let playerRoleStr = "";
    playerRoles.forEach((value, key, collection) => {
        playerRoleStr += value.name;
        playerRoleStr += "\n";
    });

    var roleInfo = new MessageEmbed()
        .addField("Main Roles", mainRoleStr)
        .addField("Player Roles", playerRoleStr)
        .setThumbnail(bot.guilds.get(Constants.BD4_ID).iconURL)
        .setColor(0x0)

    msg.channel.send({embeds: [roleInfo]});

    return true;
}
