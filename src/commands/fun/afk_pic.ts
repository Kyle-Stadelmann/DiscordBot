/* eslint-disable max-classes-per-file */
import { Message, MessageEmbed } from "discord.js";
import { bdbot } from "../../app.js";
import { AfkPic } from "../../types/afk_pic.js";
import { Command, CommandConfig } from "../../types/command.js";
import { ParentCommand, ParentCommandConfig } from "../../types/parent_command.js";
import { sendEmbeds, sendErrorMessage, sendMessage } from "../../util/message_channel.js";

const afkpicGetConfig: CommandConfig = {
    name: "get",
    description: "Sends an AFK Pic of a random (or given) user",
    usage: "afkpic [get] [@user]",
    examples: ["afkpic get", "afkpic get @Baconsunset", "afkpic", "afkpic @Meow"],
    allowInDM: true,
}

class AfkPicGetCommand extends Command {
    public async run(msg: Message, args: string[]): Promise<boolean> {
        const { channel } = msg;

        if (!bdbot.hasAfkPics()) {
            await sendMessage(channel, "Sorry, there are no AFK pics loaded.");
        }

        let afkPic = this.getCorrespondingAfkPic(msg, args);

        if (afkPic?.url) {
            const embed = new MessageEmbed().setImage(afkPic.url);
            await sendEmbeds(channel, [embed]);
            return true;
        } 

        await sendErrorMessage(channel, "Sorry, no afk pic located.");
        return false;
    }

    private getCorrespondingAfkPic(msg: Message, args: string[]): AfkPic | undefined {
        let afkPic: AfkPic;
        // Allow use of userId passed in arg too
        // Make sure passed in arg isn't unreasonbly large
        if (args.length > 0 && args[0].length < 20 && bdbot.userHasAfkPic(args[0])) {
            afkPic = bdbot.getRandomAfkPicByUser(args[0]);
        } else if (msg.mentions.users.size === 0) { 
            afkPic = bdbot.getRandomAfkPic();
        } else {
            const firstMentionId = msg.mentions.users?.first()?.id;
            if (firstMentionId && bdbot.userHasAfkPic(firstMentionId)) {
                afkPic = bdbot.getRandomAfkPicByUser(firstMentionId);
            }
        }
        return afkPic;
    }
}


const afkpicAddConfig: CommandConfig = {
    name: "add",
    description: "Adds AFK Pic(s) to the afk pic collection",
    usage: "afkpic add [image or image link]",
    examples: ["afkpic add **nathan.jpg**", "afkpic add https://i.imgur.com/wSkz6em.jpeg", "afkpic add **eric.jpg** **zach.png**"],
    allowInDM: true,
}

class AfkPicAddCommand extends Command {
    public async run(msg: Message, args: string[]): Promise<boolean> {
        const { attachments } = msg;
        if (!this.validate(msg)) return false;
        bdbot.afkPicContainer.
    }

    private async validate(msg: Message): Promise<boolean> {
        const { attachments } = msg;
        
        if (attachments.size === 0) {
            await sendErrorMessage(msg.channel, "Couldn't find an attachment to add");
            return false;
        }
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
        await this.addSubCommand(AfkPicAddCommand, afkpicAddConfig);
    }
}

export default new AfkPicCommand(afkpicConfig);