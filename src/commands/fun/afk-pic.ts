/* eslint-disable max-classes-per-file */
import { sanitizeUrl } from "@braintree/sanitize-url";
import { EmbedBuilder, CommandInteraction, ApplicationCommandOptionType, User, Attachment } from "discord.js";
import fetch from "node-fetch";
import { Discord, Guild, Slash, SlashGroup, SlashOption } from "discordx";
import { Category } from "@discordx/utilities";
import { bdbot } from "../../app.js";
import { CommandCategory } from "../../types/command.js";
import { BD5_DEV_SERVER_IDS } from "../../constants.js";

const discordRegex =
	/^(https?:)?\/\/(cdn|media)\.discordapp\.(com|net)\/attachments\/(\d*)\/(\d*)(?!.*https?:)\/(\S*)(\.(png|jpeg|jpg))(\?width=\d*&height=\d*)?/m;
const allowedImageRegex = [discordRegex, /(https?:)?\/\/(\w+\.)?imgur\.com\/(\S*)(\.(png|jpeg|jpg))/m];

@Discord()
@Category(CommandCategory.Fun)
@SlashGroup({ name: "afkpic", description: "Send or add pictures to the AFK Pic collection" })
@SlashGroup("afkpic")
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
			const embed = new EmbedBuilder().setImage(afkPicUrl).setColor(0x0);
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

	@Slash({
		name: "add",
		description:
			"Adds AFK Pic(s) to the AFK Pic collection. (Supports local uploads, discord image links, i.imgur)",
		defaultMemberPermissions: "Administrator",
	})
	async add(
		@SlashOption({
			name: "pic",
			description: "The picture you want to add to the collection",
			required: true,
			type: ApplicationCommandOptionType.Attachment,
		})
		pic: Attachment,
		@SlashOption({
			name: "pic2",
			description: "Another picture you want to add to the collection",
			required: false,
			type: ApplicationCommandOptionType.Attachment,
		})
		pic2: Attachment,
		@SlashOption({
			name: "pic3",
			description: "Another picture you want to add to the collection",
			required: false,
			type: ApplicationCommandOptionType.Attachment,
		})
		pic3: Attachment,
		@SlashOption({
			name: "pic4",
			description: "Another picture you want to add to the collection",
			required: false,
			type: ApplicationCommandOptionType.Attachment,
		})
		pic4: Attachment,
		@SlashOption({
			name: "pic5",
			description: "Another picture you want to add to the collection",
			required: false,
			type: ApplicationCommandOptionType.Attachment,
		})
		pic5: Attachment,
		@SlashOption({
			name: "pic6",
			description: "Another picture you want to add to the collection",
			required: false,
			type: ApplicationCommandOptionType.Attachment,
		})
		pic6: Attachment,
		@SlashOption({
			name: "pic7",
			description: "Another picture you want to add to the collection",
			required: false,
			type: ApplicationCommandOptionType.Attachment,
		})
		pic7: Attachment,
		@SlashOption({
			name: "pic8",
			description: "Another picture you want to add to the collection",
			required: false,
			type: ApplicationCommandOptionType.Attachment,
		})
		pic8: Attachment,
		@SlashOption({
			name: "pic9",
			description: "Another picture you want to add to the collection",
			required: false,
			type: ApplicationCommandOptionType.Attachment,
		})
		pic9: Attachment,
		@SlashOption({
			name: "pic10",
			description: "Another picture you want to add to the collection",
			required: false,
			type: ApplicationCommandOptionType.Attachment,
		})
		pic10: Attachment,
		interaction: CommandInteraction
	): Promise<boolean> {
		const { user } = interaction;
		await interaction.deferReply();
		const pics = [pic, pic2, pic3, pic4, pic5, pic6, pic7, pic8, pic9, pic10].filter((p) => p !== undefined);

		const afkPicUrls: string[] = pics.filter((p) => this.isAllowedSite(p.url)).map((p) => sanitizeUrl(p.url));

		if (afkPicUrls.length === 0) {
			await interaction.editReply("Couldn't find a valid AFK Pic to add.");
			return false;
		}

		const result = await bdbot.tryAddAfkPics(afkPicUrls, user.id);
		if (result && afkPicUrls.length > 0) {
			// TODO: Leaderboard for who submits most afk pics
			await interaction.editReply(
				`AFK Pic${afkPicUrls.length > 1 ? "s" : ""} added. Thank you for your *generous donation*!`
			);
			return true;
		}
		await interaction.editReply(
			"Failed to add any AFK Pics. This picture **may** exist already or is from an unsupported image source."
		);
		return false;
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
