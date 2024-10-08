/* eslint-disable max-classes-per-file */
import { EmbedBuilder, CommandInteraction, ApplicationCommandOptionType, User, Attachment } from "discord.js";
import { Discord, Guild, Slash, SlashGroup, SlashOption } from "discordx";
import { Category } from "@discordx/utilities";
import { bdbot } from "../../app.js";
import { CommandCategory } from "../../types/command.js";
import { BD5_DEV_SERVER_IDS } from "../../constants.js";
import { tryAddAfkPics } from "../../util/afk-pic-helper.js";

const MAX_GET_AFK_PICS = 5;

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
			name: "count",
			description: "The number of AFK pics to fetch (max of 5)",
			required: false,
			type: ApplicationCommandOptionType.Integer,
		})
		countArg: number | undefined,
		@SlashOption({
			name: "user",
			description: "The user to fetch a picture of",
			required: false,
			type: ApplicationCommandOptionType.User,
		})
		user: User | undefined,
		@SlashOption({
			name: "new",
			description: "Fetch only newer, uncategorized pics (does not work with user option)",
			required: false,
			type: ApplicationCommandOptionType.Boolean,
		})
		shouldFetchStaging: boolean | undefined,
		interaction: CommandInteraction
	): Promise<boolean> {
		if (!bdbot.hasAfkPics()) {
			await interaction.reply("Couldn't fetch pic, there are no AFK Pics loaded.");
			return false;
		}

		// Fetch between 1 and MAX_GET_AFK_PICS pics
		const count = Math.max(1, Math.min(countArg, MAX_GET_AFK_PICS));

		const afkPicUrls = this.getCorrespondingAfkPicUrls(user, shouldFetchStaging, count);

		if (afkPicUrls.length > 0) {
			const embeds: EmbedBuilder[] = [];
			afkPicUrls.forEach((url) => {
				const embed = new EmbedBuilder().setImage(url).setColor(0x0);
				embeds.push(embed);
			});
			await interaction.reply({ embeds });
			return true;
		}

		await interaction.reply("Sorry, no AFK Pic located.");
		return false;
	}

	private getCorrespondingAfkPicUrls(user?: User, shouldFetchStaging?: boolean, count?: number): string[] {
		if (user) {
			return bdbot.getRandomAfkPicUrlByUser(user.id, count);
		}
		return bdbot.getRandomAfkPicUrl(shouldFetchStaging, count);
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
		await interaction.deferReply();
		const pics = [pic, pic2, pic3, pic4, pic5, pic6, pic7, pic8, pic9, pic10].filter((p) => p !== undefined);

		return tryAddAfkPics(
			pics.map((p) => p.url),
			interaction
		);
	}
}
