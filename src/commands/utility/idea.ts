/* eslint-disable @typescript-eslint/no-unused-vars */
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
	CommandInteraction,
	ApplicationCommandOptionType,
} from "discord.js";
import { ButtonComponent, Discord, ModalComponent, Slash, SlashChoice, SlashOption } from "discordx";
import { Category } from "@discordx/utilities";
import { Pagination, PaginationType } from "@discordx/pagination";
import { LIGHTBULB } from "../../constants.js";
import { CommandCategory } from "../../types/command.js";
import { UserIdeaTypedModel, getAllIdeas, getIdeasByType } from "../../types/data-access/idea.js";
import { buildIdeaEmbeds } from "../../util/idea-helpers.js";

export enum IdeaType {
	Utility = "Utility",
	Fun = "Fun",
	Music = "Music",
	General = "General",
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
		@SlashChoice(IdeaType.Utility, IdeaType.Fun, IdeaType.Music, IdeaType.General)
		@SlashOption({
			name: "type",
			description: "Filter by idea type",
			required: false,
			type: ApplicationCommandOptionType.String,
		})
		type: string,
		@SlashOption({
			name: "completed",
			description: "Filter by completed (true) or uncompleted (false)",
			required: false,
			type: ApplicationCommandOptionType.Boolean
		})
		completed: boolean,
		interaction: CommandInteraction
	): Promise<boolean> {
		let ideas = (type) ? await getIdeasByType(type) : await getAllIdeas();
		ideas = ideas
			.filter(i => (completed === undefined) ? true : i.completed === completed)
			.sort((a, b) => a.createdAt - b.createdAt);

		// eslint-disable-next-line arrow-body-style
		const ideaPages = buildIdeaEmbeds(ideas, type as IdeaType).map(e => {return {embeds: [e]}})

		const pagination = new Pagination(interaction, ideaPages, {
			filter: (interact) => interact.user.id === interaction.user.id,
			type: PaginationType.Button
		});
		await pagination.send();

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