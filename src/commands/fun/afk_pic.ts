/* eslint-disable max-classes-per-file */
import { Message, MessageEmbed } from "discord.js";
import { bdbot } from "../../app.js";
import { AfkPic } from "../../types/afk_pic.js";
import { Command, CommandConfig } from "../../types/command.js";
import { ParentCommand, ParentCommandConfig } from "../../types/parent_command.js";
import { sendEmbeds } from "../../util/message_channel.js";

const afkpicGetConfig: CommandConfig = {
    name: "get",
    description: "Sends an AFK Pic of a random (or given) user",
    usage: "afkpic [get] [@user]",
    examples: ["afkpic get", "afkpic get @Baconsunset", "afkpic", "afkpic @Meow"],
    allowInDM: true,
}

class AfkPicGetCommand extends Command {
    public async run(msg: Message, args: string[]): Promise<boolean> {
        const {afkPicContainer} = bdbot;
        const { channel } = msg;
        let afkPic: AfkPic;

        // Allow use of userId passed in arg too
        // Make sure passed in arg isn't unreasonbly large
        if (args.length > 0 && args[0].length < 20 && afkPicContainer.hasUser(args[0])) {
            afkPic = afkPicContainer.getPic(args[0]);
        } else {
            const firstMentionId = msg.mentions.members?.first()?.id;
            if (firstMentionId) {
                afkPic = afkPicContainer.getPic(firstMentionId);
            } else {
                // Random pic
                afkPic = afkPicContainer.getPic();
            }
        }

        const embed = new MessageEmbed().setImage(afkPic.url);
        await sendEmbeds(channel, [embed]);
        
        return true;
    }
}

const afkpicConfig: ParentCommandConfig = {
    name: "afkpic",
    description: "Sends an AFK Pic of a random (or given) user",
    shareCooldownMap: false
}

class AfkPicCommand extends ParentCommand {
    constructor(options: ParentCommandConfig) {
        super(options);

        const getCmd = new AfkPicGetCommand(afkpicGetConfig);
        this.subCommands.push(getCmd);

        this.defaultCmd = getCmd;
    }
}

export default new AfkPicCommand(afkpicConfig);