import { Message, MessageEmbed } from 'discord.js';
import Constants from '../constants';
import { Command, CommandCategory } from '../interfaces/command';

export const cmd: Command = {
    name: 'bipen',
    description: 'Sends an important Bipen quote.',
    usage: 'bipen',
    allowInDM: true,
    aliases: [],
    category: CommandCategory.Fun,
    disabled: false,
    cooldownTime: 0.5*1000,
    cooldowns: new Map(),
    permissions: [],
    run: run
}

async function run(msg: Message, args: string[]): Promise<boolean> {
    let message = "I'm a dragon, Rob! ~ *Bipen*";
    
    let embed = new MessageEmbed()
        .addField("Bipen", message)
        .setImage(Constants.BIPEN_IMG_URL)
        .setFooter(`R.I.P. Bipen 08/2012`)
        .setColor(0x0)

    msg.channel.send({embeds: [embed]});
    return true;
}