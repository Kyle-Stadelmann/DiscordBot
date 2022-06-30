import { Message } from "discord.js";
import { Command, CommandCategory } from "../interfaces/command";

export const cmd: Command = {
    name: "connect",
    description: "BD4 Bot connects to the user's voice channel.",
    usage: "connect",
    examples: [],
    allowInDM: false,
    aliases: [],
    category: CommandCategory.Utility,
    disabled: false,
    cooldownTime: 0.5*1000,
    cooldowns: new Map(),
    permissions: [],
    run: run
}

async function run(msg: Message, args: string[]): Promise<boolean> {
    // User's voice channel
    let voiceChannel = message.member.voice.channel;
    
    // Error checking
    if(!voiceChannel ||
        voiceChannel === message.guild.afkChannel) {
            message.channel.send("You are not connected to a valid voice channel!");
            return false;
    }
    
    message.channel.send(`Connecting to ${voiceChannel.name}`);
    message.member.voice.channel.join();

    return true;
}
