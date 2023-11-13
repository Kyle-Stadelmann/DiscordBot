/* eslint-disable max-classes-per-file */
import { sanitizeUrl } from "@braintree/sanitize-url";
import { EmbedBuilder, CommandInteraction, ApplicationCommandOptionType, User, Attachment } from "discord.js";
import fetch from "node-fetch";
import { Discord, Guild, Slash, SlashGroup, SlashOption } from "discordx";
import { Category } from "@discordx/utilities";
import { bdbot } from "../../app.js";
import { CommandCategory } from "../../types/command.js";
import { BD5_DEV_SERVER_IDS } from "../../constants.js";

const afkpicGetConfig: CommandConfig = {
	usage: "afkpic [get] [@user]",
	examples: ["afkpic get", "afkpic get @Baconsunset", "afkpic", "afkpic @Meow"],
	allowInDM: true,
};

@Discord()
@SlashGroup({ name: "afkpic", description: "!" })
@SlashGroup("afkpic")
@Category(CommandCategory.Fun)
@Guild(BD5_DEV_SERVER_IDS)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class AfkPicCommand {
	@Slash({ name: "get", description: "Sends an AFK Pic of a random (or given) user" })
	async get(
		@SlashOption({
			name: "user",
			description: "The user to fetch a picture of",
			required: false,
			type: ApplicationCommandOptionType.User,
		})
		user: User | undefined,
		interaction: CommandInteraction
	): Promise<boolean> {
		if (!bdbot.hasAfkPics()) {
			await interaction.reply("Couldn't fetch pic, there are no AFK Pics loaded.");
			return false;
		}

		const afkPicUrl = this.getCorrespondingAfkPicUrl(user);

		if (afkPicUrl) {
			const embed = new EmbedBuilder().setImage(afkPicUrl);
			await interaction.reply({ embeds: [embed] });
			return true;
		}

		await interaction.reply("Sorry, no AFK Pic located.");
		return false;
	}

	private getCorrespondingAfkPicUrl(user: User | undefined): string | undefined {
		let url: string;
		if (user) {
			if (bdbot.hasAfkPicsOfUser(user.id)) {
				url = bdbot.getRandomAfkPicUrlByUser(user.id);
			}
		} else {
			url = bdbot.getRandomAfkPicUrl();
		}
		return url;
	}

	// TODO: Multiple attachments?
	@Slash({
		name: "add",
		description:
			"Adds AFK Pic(s) to the AFK Pic collection. (Supports local uploads, discord image links, i.imgur)",
	})
	async add(
		@SlashOption({
			name: "pic",
			description: "The picture you want to add to the collection",
			required: true,
			type: ApplicationCommandOptionType.Attachment,
		})
		pic: Attachment,
		interaction: CommandInteraction
	): Promise<boolean> {
		const hadError = await this.hadError(pic);
		if (hadError) {
			await interaction.reply("Couldn't find a valid AFK Pic to add.");
			return false;
		}

		const afkPicUrls: string[] = []
			.concat(attachments.map((attch) => attch.url))
			.concat(args.filter((arg) => this.isAllowedSite(arg)))
			.map((url) => sanitizeUrl(url));

		const result = await bdbot.tryAddAfkPics(afkPicUrls, msg.author.id);
		if (result && afkPicUrls.length > 0) {
			// TODO: Leaderboard for who submits most afk pics
			await interaction.reply(
				`AFK Pic${afkPicUrls.length > 1 ? "s" : ""} added. Thank you for your *generous donation*!`
			);
			return true;
		}
		await interaction.reply(
			"Failed to add any AFK Pics. This picture **may** exist already or is from an unsupported image source."
		);
		return false;
	}

	private async hadError(pic: Attachment): Promise<boolean> {
		if (!(await this.hasAllowedSite(args))) {
			return true;
		}
		return false;
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

const discordRegex =
	/^(https?:)?\/\/(cdn|media)\.discordapp\.(com|net)\/attachments\/(\d*)\/(\d*)(?!.*https?:)\/(\S*)(\.(png|jpeg|jpg))(\?width=\d*&height=\d*)?/m;
const allowedImageRegex = [discordRegex, /(https?:)?\/\/(\w+\.)?imgur\.com\/(\S*)(\.(png|jpeg|jpg))/m];

const afkpicAddConfig: CommandConfig = {
	name: "add",
	description: "",
	category: CommandCategory.Fun,
	usage: "afkpic add [image or image link]",
	examples: [
		"afkpic add **nathan.jpg**",
		"afkpic add https://i.imgur.com/wSkz6em.jpeg",
		"afkpic add **eric.jpg** **zach.png**",
	],
	allowInDM: true,
};
