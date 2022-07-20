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
        let outputMsg: string;

        // Allow use of userId passed in arg too
        // Make sure passed in arg isn't unreasonbly large
        if (args.length > 0 && args[0].length < 20 && afkPicContainer.hasUser(args[0])) {
            afkPic = afkPicContainer.getPic(args[0]);
        } else {
            const firstMentionId = msg.mentions.users?.first()?.id;
            if (firstMentionId) {
                afkPic = afkPicContainer.getPic(firstMentionId);
            } else {
                if (msg.mentions?.users?.size > 0) {
                    outputMsg += "Sorry, could not find that user. With their permission, ask a dev to add them to this command.";
                }
                // Random pic
                afkPic = afkPicContainer.getPic();
            }
        }

        const embed = new MessageEmbed().setImage(afkPic.url);
        await sendEmbeds(channel, [embed], outputMsg);
        
        return true;
    }
}


const afkpicConfig: ParentCommandConfig = {
    name: "afkpic",
    description: "Sends an AFK Pic of a random (or given) user",
    shareCooldownMap: false,
    defaultCmdStr: "get"
}

class AfkPicCommand extends ParentCommand {
    public override async initCmd() {
        await super.initCmd();
        await this.addSubCommand(AfkPicGetCommand, afkpicGetConfig);
    }
}

export default new AfkPicCommand(afkpicConfig);