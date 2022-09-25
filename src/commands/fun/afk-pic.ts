/* eslint-disable max-classes-per-file */
import { sanitizeUrl } from "@braintree/sanitize-url";
import { Message, EmbedBuilder } from "discord.js";
import fetch from "node-fetch";
import { bdbot } from "../../app.js";
import { Command, CommandConfig } from "../../types/command.js";
import { ParentCommand, ParentCommandConfig } from "../../types/parent-command.js";
import { sendEmbeds, sendErrorMessage, sendMessage } from "../../util/message-channel.js";

const afkpicGetConfig: CommandConfig = {
	name: "get",
	description: "Sends an AFK Pic of a random (or given) user",
	usage: "afkpic [get] [@user]",
	examples: ["afkpic get", "afkpic get @Baconsunset", "afkpic", "afkpic @Meow"],
	allowInDM: true,
};

class AfkPicGetCommand extends Command {
	public async run(msg: Message, args: string[]): Promise<boolean> {
		const { channel } = msg;

		if (!bdbot.hasAfkPics()) {
			await sendMessage(channel, "Sorry, there are no AFK Pics loaded.");
			return false;
		}

		const afkPicUrl = this.getCorrespondingAfkPicUrl(msg, args);

		if (afkPicUrl) {
			const embed = new EmbedBuilder().setImage(afkPicUrl);
			await sendEmbeds(channel, [embed]);
			return true;
		}

		await sendErrorMessage(channel, "Sorry, no AFK Pic located.");
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

const discordRegex =
	/(https?:)?\/\/(cdn|media)\.discordapp\.(com|net)\/attachments\/(\d*)\/(\d*)\/(\S*)(\.(png|jpeg|jpg))(\?width=\d*&height=\d*)?/m;
const allowedImageRegex = [discordRegex, /(https?:)?\/\/(\w+\.)?imgur\.com\/(\S*)(\.(png|jpeg|jpg))/m];

const afkpicAddConfig: CommandConfig = {
	name: "add",
	description: "Adds AFK Pic(s) to the AFK Pic collection. (Supports local uploads, discord image links, i.imgur)",
	usage: "afkpic add [image or image link]",
	examples: [
		"afkpic add **nathan.jpg**",
		"afkpic add https://i.imgur.com/wSkz6em.jpeg",
		"afkpic add **eric.jpg** **zach.png**",
	],
	allowInDM: true,
};

// TODO: Make admin only
class AfkPicAddCommand extends Command {
	public async run(msg: Message, args: string[]): Promise<boolean> {
		const { attachments, channel } = msg;

		if (!(await this.validate(msg, args))) return false;

		const afkPicUrls: string[] = []
			.concat(attachments.map((attch) => attch.url))
			.concat(args.filter((arg) => this.isAllowedSite(arg)))
			.map((url) => sanitizeUrl(url));

		const result = await bdbot.tryAddAfkPics(afkPicUrls, msg.author.id);
		if (result && afkPicUrls.length > 0) {
			// TODO: Leaderboard for who submits most afk pics
			await sendMessage(
				channel,
				`AFK Pic${afkPicUrls.length > 1 ? "s" : ""} added. Thank you for your *generous donation*!`
			);
			return true;
		}
		await sendErrorMessage(
			channel,
			"Failed to add any AFK Pics. This picture **may** exist already or is from an unsupported image source."
		);
		return false;
	}

	private async validate(msg: Message, args: string[]): Promise<boolean> {
		const { attachments } = msg;
		if (attachments.size === 0 && !(await this.hasAllowedSite(args))) {
			await sendErrorMessage(msg.channel, "Couldn't find a valid AFK Pic to add.");
			return false;
		}
		return true;
	}

	private async hasAllowedSite(args: string[]): Promise<boolean> {
		const isAllowedArray = await Promise.all(args.map((arg) => this.isAllowedSite(arg)));
		return isAllowedArray.some((isAllowed) => isAllowed);
	}

	private async isAllowedSite(url: string): Promise<boolean> {
		const cleanUrl = sanitizeUrl(url);
		const isUrlAllowed = allowedImageRegex.some((regex) => regex.test(cleanUrl));
		if (!isUrlAllowed) {
			return false;
		}
		// Discord cdn files can't be fetched (error 403 Forbidden). So assume link has valid pic
		return discordRegex.test(cleanUrl) ? true : (await fetch(cleanUrl)).ok;
	}
}

const afkpicConfig: ParentCommandConfig = {
	name: "afkpic",
	description: "Sends an AFK Pic of a random (or given) user",
	shareCooldownMap: false,
	defaultCmdStr: "get",
	aliases: ["pic"],
	allowInDM: true,
};

class AfkPicCommand extends ParentCommand {
	constructor(options: ParentCommandConfig) {
		super(options);
		this.addSubCommand(AfkPicGetCommand, afkpicGetConfig);
		this.addSubCommand(AfkPicAddCommand, afkpicAddConfig);
	}
}

export default new AfkPicCommand(afkpicConfig);
