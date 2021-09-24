import { Client, Message, MessageEmbed } from 'discord.js';
import Constants from '../constants';

export const help = {
    commandName: "bipen",
    description: "Sends an important Bipen quote.",
    usage: `bipen`,
}

export const dmAllow = true;
export const disabled = false;

export const run = async (bot : Client, msg : Message, args) => {
    let message = "I'm a dragon, Rob! ~ *Bipen*";
    
    let embed = new MessageEmbed()
        .addField("Bipen", message)
        .setImage(Constants.BIPEN_IMG_URL)
        .setFooter(`R.I.P. Bipen 08/2012`)
        .setColor(0x0)

    msg.channel.send({embeds: [embed]});
    return true;
}
