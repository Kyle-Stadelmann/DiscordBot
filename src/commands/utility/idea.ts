import {
	ActionRowBuilder,
	ModalSubmitInteraction,
	TextInputBuilder,
	TextInputStyle,
	ModalBuilder,
	CommandInteraction,
	ApplicationCommandOptionType,
} from "discord.js";
import { Discord, ModalComponent, Slash, SlashChoice, SlashGroup, SlashOption } from "discordx";
import { Category } from "@discordx/utilities";
import { Pagination, PaginationType } from "@discordx/pagination";
import { CommandCategory } from "../../types/command.js";
import { createIdea, getAllIdeas, getIdeasByType } from "../../types/data-access/idea.js";
import { buildIdeaEmbeds } from "../../util/idea-helpers.js";
import { ARROW_BACKWARD_EMOJI, ARROW_FORWARD_EMOJI } from "../../constants.js";

export enum IdeaType {
	Utility = "Utility",
	Fun = "Fun",
	Music = "Music",
	General = "General",
}

@Discord()
@SlashGroup({name: "idea", description: "List or submit ideas/feature requests for this bot"})
@SlashGroup("idea")
@Category(CommandCategory.Utility)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class IdeaCommand {
	@Slash({ name: "submit", description: "Submit an idea/feature request to the development team" })
	public async submit(interaction: CommandInteraction): Promise<boolean> {
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
			type: ApplicationCommandOptionType.Boolean,
		})
		completed: boolean,
		interaction: CommandInteraction
	): Promise<boolean> {
		let ideas = type ? await getIdeasByType(type) : await getAllIdeas();
		ideas = ideas
			.filter((i) => (completed === undefined ? true : i.completed === completed))
			.sort((a, b) => a.createdAt - b.createdAt);

		// eslint-disable-next-line arrow-body-style
		const ideaPages = buildIdeaEmbeds(ideas, type as IdeaType).map((e) => {
			return { embeds: [e] };
		});

		const pagination = new Pagination(interaction, ideaPages, {
			filter: (interact) => interact.user.id === interaction.user.id,
			type: PaginationType.Button,
			next: {label: `${ARROW_FORWARD_EMOJI} Next`},
			previous: {label: `${ARROW_BACKWARD_EMOJI} Previous`}
		});
		await pagination.send();

		return true;
	}

	@ModalComponent({ id: "idea-modal" })
	async submitIdeaModal(interaction: ModalSubmitInteraction): Promise<void> {
		await interaction.deferReply();
		const [ideaType, ideaStr] = ["type-field", "idea-field"].map((id) => interaction.fields.getTextInputValue(id));

		if (!(ideaType in IdeaType)) {
			await interaction.reply({
				content:
					`${interaction.user.toString()}, please make sure your type ` +
					"matches one of: `utility | fun | music | general`.\n" +
					"Here's your idea if you would like to resubmit:\n" +
					`${ideaStr}`,
				ephemeral: true,
			});

			return;
		}

		try {
			const idea = await createIdea(crypto.randomUUID(), interaction.user.id, ideaType, ideaStr);

			await interaction.reply({
				content: `${interaction.user.toString()} successfully submitted idea: "${
					idea.description
				}" with type "${idea.type}"`,
				ephemeral: true,
			});
			console.log(`Idea with ID: ${idea.id} submitted to DB by ${interaction.user.username}`);
		} catch (e) {
			console.error("Couldn't create idea in db.");
			console.error(e);
			await interaction.reply({
				content: `Internal error. Failed to sumbit idea: "${ideaStr}" with type "${ideaType}"`,
				ephemeral: true,
			});
		}
	}
}
