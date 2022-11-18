import { CommandInteraction } from "discord.js";
import { ArgsOf, Discord, On } from "discordx";
import { bdbot } from "../../app.js";

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export abstract class CommandHandler {
	@On({ event: "interactionCreate" })
	private async handleCommand([interaction]: ArgsOf<"interactionCreate">) {
        if (!interaction.isChatInputCommand()) return;

        await this.processCmd(interaction);
	}

	private async processCmd(interaction: CommandInteraction) {
        const {commandName, user} = interaction;
        
		console.log(`${commandName} command detected by: ${user.username}`);

		const result = await bdbot.tryRunCommand(interaction);
		if (result) {
			console.log(`${commandName} was successful`);
		} else {
			console.error(`${commandName} was NOT successful`);
		}
	}
}
