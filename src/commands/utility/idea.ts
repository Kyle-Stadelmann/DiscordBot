/* eslint-disable max-classes-per-file */
import {
	ButtonInteraction,
	ActionRowBuilder,
	ModalSubmitInteraction,
	ButtonBuilder,
	TextInputBuilder,
	TextInputStyle,
	ButtonStyle,
	ModalBuilder,
	EmbedBuilder,
	CommandInteraction,
	ApplicationCommandOptionType,
} from "discord.js";
import { ButtonComponent, Discord, ModalComponent, Slash, SlashChoice, SlashOption } from "discordx";
import { Category } from "@discordx/utilities";
import { Pagination, PaginationItem } from "@discordx/pagination";
import { ARROW_BACKWARD_ID, ARROW_FORWARD_ID, IDEA_TYPES, LIGHTBULB } from "../../constants.js";
import { CommandCategory } from "../../types/command.js";
import { UserIdeaTypedModel } from "../../types/data-access/idea.js";
import { refreshIdeas } from "../../util/index.js";

let sortedIdeaPages = await refreshIdeas();

export enum IdeaType {
	all = "all",
	utility = "utility",
	fun = "fun",
	music = "music",
	general = "general",
}

@Discord()
@Category(CommandCategory.Utility)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class IdeaCommand {
	@Slash({ name: "submit", description: "Submit an idea/feature request to the development team" })
	public async submit(interaction: CommandInteraction): Promise<boolean> {
		const ideaBtn = new ButtonBuilder()
			.setLabel("Submit Idea")
			.setEmoji(LIGHTBULB)
			.setStyle(ButtonStyle.Primary)
			.setCustomId("submit-btn");

		const ideaRow = new ActionRowBuilder<ButtonBuilder>().addComponents(ideaBtn);

		await interaction.reply({
			content: "Click the button below to submit your idea!",
			components: [ideaRow],
		});

		return true;
	}

	@Slash({ name: "list", description: "Lists user-submitted ideas" })
	async list(
		@SlashChoice(IdeaType.utility, IdeaType.fun, IdeaType.music, IdeaType.general)
		@SlashOption({
			name: "type",
			description: "Filter by idea type",
			required: false,
			type: ApplicationCommandOptionType.String,
		})
		type: string,
		interaction: CommandInteraction
	): Promise<boolean> {
		sortedIdeaPages = await refreshIdeas();

		const pages: PaginationItem[] = [];

		const pagination = new Pagination(interaction);
		await pagination.send();

		const ideaPages: EmbedBuilder[] = sortedIdeaPages[IdeaType[args[0]] ? IdeaType[args[0]] : IdeaType.all];

		const ideaBackBtn = new ButtonBuilder()
			.setLabel("Previous Page")
			.setEmoji(ARROW_BACKWARD_ID)
			.setStyle(ButtonStyle.Primary)
			.setCustomId("idea-back-btn");

		const ideaForwardBtn = new ButtonBuilder()
			.setLabel("Next Page")
			.setEmoji(ARROW_FORWARD_ID)
			.setStyle(ButtonStyle.Primary)
			.setCustomId("idea-forward-btn");

		const ideaScrollRow = new ActionRowBuilder<ButtonBuilder>().addComponents([ideaBackBtn, ideaForwardBtn]);

		await interaction.reply({
			embeds: [ideaPages[0]],
			components: [ideaScrollRow],
		});

		return true;
	}
}

@Discord()
class IdeaButton {
	@ButtonComponent({ id: "submit-btn" })
	async submitBtn(interaction: ButtonInteraction) {
		// create modal to get idea data
		const modal = new ModalBuilder().setTitle("Submit an Idea").setCustomId("idea-modal");

		const typeInputComponent = new TextInputBuilder()
			.setCustomId("type-field")
			.setLabel("Idea Type (fun/utility/music/general)")
			.setStyle(TextInputStyle.Short);
		const ideaInputComponent = new TextInputBuilder()
			.setCustomId("idea-field")
			.setLabel("Write your idea")
			.setStyle(TextInputStyle.Paragraph);

		const row1 = new ActionRowBuilder<TextInputBuilder>().addComponents(typeInputComponent);
		const row2 = new ActionRowBuilder<TextInputBuilder>().addComponents(ideaInputComponent);

		modal.addComponents(row1, row2);

		await interaction.showModal(modal);
	}

	@ModalComponent({ id: "idea-modal" })
	async submitIdeaModal(interaction: ModalSubmitInteraction): Promise<void> {
		const [ideaType, idea] = ["type-field", "idea-field"].map((id) => interaction.fields.getTextInputValue(id));

		if (!IDEA_TYPES.includes(ideaType)) {
			await interaction.reply({
				content:
					`${interaction.user.toString()}, please make sure your type ` +
					"matches one of: `utility | fun | music | general`.\n" +
					"Here's your idea if you would like to resubmit:\n" +
					`${idea}`,
				ephemeral: true,
			});

			return;
		}

		await interaction.reply({
			content: `${interaction.user.toString()} successfully submitted idea: "${idea}" with type "${ideaType}"`,
			ephemeral: true,
		});

		try {
			await UserIdeaTypedModel.create({
				id: interaction.id,
				userId: interaction.user.id,
				type: ideaType,
				description: idea,
				completed: false,
			});
		} catch (e) {
			console.error(e);
		}

		const newLocal = `Idea with ID: ${interaction.id} submitted to DB by ${interaction.user.username}`;
		console.log(newLocal);
	}
}

@Discord()
class IdeaBackButton {
	@ButtonComponent({ id: "idea-back-btn" })
	async backBtn(interaction: ButtonInteraction) {
		if (interaction.component.label === "Previous Page") {
			const findIdeaTypeFilter = (t: EmbedBuilder[]) =>
				t[0].data.title.split(" ")[0] === interaction.message.embeds[0].title.split(" ")[0];

			let pageNum = parseInt(interaction.message.embeds[0].data.title.split("Page ")[1], 10) - 1;
			const ideaPages = sortedIdeaPages.filter(findIdeaTypeFilter)[0];

			pageNum = pageNum > 0 ? (pageNum -= 1) : ideaPages.length - 1;
			await interaction.message.edit({
				embeds: [ideaPages[pageNum]],
			});
		}

		await interaction.deferUpdate();
		return true;
	}
}

@Discord()
class IdeaForwardButton {
	@ButtonComponent({ id: "idea-forward-btn" })
	async forwardBtn(interaction: ButtonInteraction) {
		if (interaction.component.label === "Next Page") {
			const findIdeaTypeFilter = (t: EmbedBuilder[]) =>
				t[0].data.title.split(" ")[0] === interaction.message.embeds[0].title.split(" ")[0];

			let pageNum = parseInt(interaction.message.embeds[0].data.title.split("Page ")[1], 10) - 1;
			const ideaPages = sortedIdeaPages.filter(findIdeaTypeFilter)[0];

			pageNum = pageNum + 1 < ideaPages.length ? (pageNum += 1) : 0;
			await interaction.message.edit({
				embeds: [ideaPages[pageNum]],
			});
		}

		await interaction.deferUpdate();
		return true;
	}
}
