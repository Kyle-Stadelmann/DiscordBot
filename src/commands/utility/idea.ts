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
} from "discord.js";
import { ButtonComponent, Discord, ModalComponent } from "discordx";
import { BD4_BOT_ID, LIGHTBULB } from "../../constants.js";
import { CommandConfig, Command } from "../../types/command.js";
import { getAllIdeas, UserIdeaTypedModel } from "../../types/data-access/idea.js";
import { ParentCommand, ParentCommandConfig } from "../../types/parent-command.js";

const ideaSubmitConfig: CommandConfig = {
	name: "submit",
	description: "Submit an idea/feature request to the development team.",
	usage: "idea submit",
	allowInDM: true,
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
	@ButtonComponent({id: "submit-btn"})
	async submitBtn(interaction: ButtonInteraction) {
		// create modal to get idea data
		const modal = new ModalBuilder()
			.setTitle("Submit an Idea")
			.setCustomId("idea-modal");

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

	@ModalComponent({id: "idea-modal"})
	async submitIdeaModal(interaction: ModalSubmitInteraction): Promise<void> {
		const [ideaType, idea] = ["type-field", "idea-field"].map((id) => interaction.fields.getTextInputValue(id));

		if (!["utility", "fun", "music", "general"].includes(ideaType)) {
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
};

class IdeaListCommand extends Command {
	public async run(msg: Message): Promise<boolean> {
		// get ideas
		const ideas = getAllIdeas();
		console.log(ideas);
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
}

class IdeaCommand extends ParentCommand {
	constructor(options: ParentCommandConfig) {
		super(options);
		this.addSubCommand(IdeaSubmitCommand, ideaSubmitConfig);
		this.addSubCommand(IdeaListCommand, ideaListConfig);
	}
}

export default new IdeaCommand(ideaConfig);
