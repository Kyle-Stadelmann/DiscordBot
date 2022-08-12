/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-classes-per-file */
import { ButtonInteraction, Message, MessageActionRow, MessageButton, Modal, ModalActionRowComponent, ModalSubmitInteraction, TextInputComponent } from "discord.js";
import { ButtonComponent, Discord, ModalComponent } from "discordx";
import { BD4_BOT_ID, LIGHTBULB } from "../../constants.js";
import { CommandConfig, Command } from "../../types/command.js";
import { UserIdeaTypedModel } from "../../types/data_access/idea.js";

const cmdConfig: CommandConfig = {
	name: "idea",
	description: "Submit an idea/feature request to the development team.",
	usage: "idea",
    aliases: ["feedback", "suggest", "suggestion"],
    allowInDM: true,
};

class IdeaCommand extends Command {
	public async run(msg: Message, args: string[]): Promise<boolean> {
        // i think you can dynamically grab CommandType to make types[]
        // youd still have to add "General" though
        // https://www.youtube.com/watch?v=mScQ38_jffg this is crazy rn
        // i was gonna say something else but i forgot

        if (msg.author.id === BD4_BOT_ID) return false;

        const ideaBtn = new MessageButton()
            .setLabel("Submit Idea")
            .setEmoji(LIGHTBULB)
            .setStyle("PRIMARY")
            .setCustomId("submit-btn");
        
        const ideaRow = new MessageActionRow().addComponents(ideaBtn);

        await msg.channel.send({
            content: "Click the button below to submit your idea!",
            components: [ideaRow],
        });
        
		return true;
	}
}

@Discord()
class IdeaButton {
    @ButtonComponent("submit-btn")
    async submitBtn(interaction: ButtonInteraction) {
        // create modal to get idea data
        const modal = new Modal()
            .setTitle("Submit an Idea")
            .setCustomId("idea-modal");

        const typeInputComponent = new TextInputComponent()
            .setCustomId("type-field")
            .setLabel("Idea Type (fun/utility/music/general)")
            .setStyle("SHORT");
        const ideaInputComponent = new TextInputComponent()
            .setCustomId("idea-field")
            .setLabel("Write your idea")
            .setStyle("PARAGRAPH");

        const row1 = new MessageActionRow<ModalActionRowComponent>().addComponents(
            typeInputComponent
        );
        const row2 = new MessageActionRow<ModalActionRowComponent>().addComponents(
            ideaInputComponent
        );

        modal.addComponents(row1, row2);

        await interaction.showModal(modal);
    }

    @ModalComponent("idea-modal")
    async submitIdeaModal(interaction: ModalSubmitInteraction): Promise<void> {
        const [ideaType, idea] = ["type-field", "idea-field"].map((id) =>
            interaction.fields.getTextInputValue(id)
        );

        if (!["utility", "fun", "music", "general"].includes(ideaType)) {
            await interaction.reply({
                content: `${interaction.user.toString()}, please make sure your type `
                + "matches one of: `utility | fun | music | general`.\n"
                + "Here's your idea if you would like to resubmit:\n"
                + `${idea}`,
                ephemeral: true,
            });
            
            return;
        }

        await interaction.reply({
            content: `${interaction.user.toString()} successfully submitted `
            + `idea: "${idea}" with type "${ideaType}"`,
            ephemeral: true,
        });

        await UserIdeaTypedModel.create({
            id: interaction.id,
            userId: interaction.user.id,
            type: ideaType,
            description: idea,
        });
        console.log(`Idea with ID: ${interaction.id} submitted to DB by `
        + `${interaction.user.username}`);
    }
}

export default new IdeaCommand(cmdConfig);
