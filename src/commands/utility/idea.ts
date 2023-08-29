/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-classes-per-file */
import {
	ButtonInteraction,
	Message,
	ActionRowBuilder,
	ModalSubmitInteraction,
	ButtonBuilder,
	TextInputBuilder,
	TextInputStyle,
	ButtonStyle,
	ModalBuilder,
	EmbedBuilder,
} from "discord.js";
import { ButtonComponent, Discord, ModalComponent } from "discordx";
import { ARROW_BACKWARD_ID, ARROW_FORWARD_ID, BD4_BOT_ID, IDEA_TYPES, LIGHTBULB } from "../../constants.js";
import { CommandConfig, Command, CommandCategory } from "../../types/command.js";
import { UserIdeaTypedModel } from "../../types/data-access/idea.js";
import { ParentCommand, ParentCommandConfig } from "../../types/parent-command.js";
import { refreshIdeas } from "../../util/idea-helpers.js";

let sortedIdeaPages = await refreshIdeas();

const ideaSubmitConfig: CommandConfig = {
	name: "submit",
	description: "Submit an idea/feature request to the development team.",
	usage: "idea submit",
	allowInDM: true,
	category: CommandCategory.Utility,
};

class IdeaSubmitCommand extends Command {
	public async run(msg: Message): Promise<boolean> {
		// i think you can dynamically grab CommandType to make types[]
		// youd still have to add "General" though
		// https://www.youtube.com/watch?v=mScQ38_jffg this is crazy rn
		// i was gonna say something else but i forgot

		if (msg.author.id === BD4_BOT_ID) return false;

		const ideaBtn = new ButtonBuilder()
			.setLabel("Submit Idea")
			.setEmoji(LIGHTBULB)
			.setStyle(ButtonStyle.Primary)
			.setCustomId("submit-btn");

		const ideaRow = new ActionRowBuilder<ButtonBuilder>().addComponents(ideaBtn);

		await msg.channel.send({
			content: "Click the button below to submit your idea!",
			components: [ideaRow],
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

		await UserIdeaTypedModel.create({
			id: interaction.id,
			userId: interaction.user.id,
			type: ideaType,
			description: idea,
		});
		const newLocal = `Idea with ID: ${interaction.id} submitted to DB by ${interaction.user.username}`;
		console.log(newLocal);
	}
}

const ideaListConfig: CommandConfig = {
	name: "list",
	description: "List all ideas [of a certain type]",
	usage: "idea list [type]",
	examples: ["idea list", "idea list music", "idea list utility"],
	allowInDM: true,
	category: CommandCategory.Utility,
};

class IdeaListCommand extends Command {
	public async run(msg: Message, args: string[]): Promise<boolean> {
		sortedIdeaPages = await refreshIdeas();
		enum Types {
			all = 0,
			utility = 1,
			fun = 2,
			music = 3,
			general = 4,
		}

		const ideaPages: EmbedBuilder[] = sortedIdeaPages[Types[args[0]] ? Types[args[0]] : Types.all];

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

		await msg.channel.send({
			embeds: [ideaPages[0]],
			components: [ideaScrollRow],
		});

		return true;
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

const ideaConfig: ParentCommandConfig = {
	name: "idea",
	description: "Submit an idea to the developers",
	shareCooldownMap: false,
	defaultCmdStr: "submit",
	aliases: ["feedback"],
	allowInDM: true,
	category: CommandCategory.Utility,
};

class IdeaCommand extends ParentCommand {
	constructor(options: ParentCommandConfig) {
		super(options);
		this.addSubCommand(IdeaSubmitCommand, ideaSubmitConfig);
		this.addSubCommand(IdeaListCommand, ideaListConfig);
	}
}

export default new IdeaCommand(ideaConfig);
