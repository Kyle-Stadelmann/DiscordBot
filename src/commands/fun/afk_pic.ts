/* eslint-disable max-classes-per-file */
import { sanitizeUrl } from "@braintree/sanitize-url";
import { Message, MessageEmbed } from "discord.js";
import { bdbot } from "../../app.js";
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
            return false;
        }

        const afkPicUrl = this.getCorrespondingAfkPicUrl(msg, args);

        if (afkPicUrl) {
            const embed = new MessageEmbed().setImage(afkPicUrl);
            await sendEmbeds(channel, [embed]);
            return true;
        } 

        await sendErrorMessage(channel, "Sorry, no afk pic located.");
        return false;
    }

    private getCorrespondingAfkPicUrl(msg: Message, args: string[]): string | undefined {
        let url: string;
        // Allow use of userId passed in arg too
        // Make sure passed in arg isn't unreasonbly large (idk if this really helps with security though)
        if (args.length > 0 && args[0].length < 20 && bdbot.hasUser(args[0])) {
            url = bdbot.getRandomAfkPicUrlByUser(args[0]);
        } else if (msg.mentions.users.size === 0) { 
            url = bdbot.getRandomAfkPicUrl();
        } else {
            const firstMentionId = msg.mentions.users?.first()?.id;
            if (firstMentionId && bdbot.hasUser(firstMentionId)) {
                url = bdbot.getRandomAfkPicUrlByUser(firstMentionId);
            }
        }
        return url;
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
    public async run(msg: Message): Promise<boolean> {
        const { attachments, channel } = msg;
        if (!await this.validate(msg)) return false;
        const afkPicUrls = attachments.map(attch => sanitizeUrl(attch.url));
        
        const result = await bdbot.tryAddAfkPics(afkPicUrls, msg.author.id);
        if (result) {
            await sendMessage(channel, "AFK Picture(s) added. Thank you for your *generous donation*!");
        } else {
            await sendErrorMessage(channel, "Failed to add AFK Pictures. This picture **may** exist already.");
        }
        return result;
    }

    private async validate(msg: Message): Promise<boolean> {
        const { attachments } = msg;
        
        if (attachments.size === 0) {
            await sendErrorMessage(msg.channel, "Couldn't find an afk pic to add.");
            return false;
        }
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
        await this.addSubCommand(AfkPicAddCommand, afkpicAddConfig);
    }
}

export default new AfkPicCommand(afkpicConfig);