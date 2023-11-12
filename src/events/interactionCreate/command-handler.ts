import { APIGuildMember, ChatInputCommandInteraction, GuildMember, Snowflake } from "discord.js";
import { ArgsOf, Discord, On } from "discordx";
import { bdbot, client } from "../../app.js";
import { createCmdErrorStr, isProdMode, printSpace, sendErrorToDiscordChannel } from "../../util/index.js";

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export abstract class CommandHandler {
	@On({ event: "interactionCreate" })
	private async handleCommand([interaction]: ArgsOf<"interactionCreate">) {
        if (!interaction.isChatInputCommand()) {
			client.executeInteraction(interaction);
			return;
		}

        const {commandName, user, guildId, member} = interaction;

		let personId;
		try {
			personId = this.determinePersonId(member, guildId, user.id);
			await this.processCmd(interaction, personId);
		} catch (error) {
			const errStr = createCmdErrorStr(commandName, error, interaction);
			console.error(errStr);
			printSpace();
			if (isProdMode()) {
				await sendErrorToDiscordChannel(errStr);
			}
			try {
				if (!interaction.replied) await interaction.reply("Sorry, an error has occurred!");
				else await interaction.editReply("Sorry, an error has occurred!");
			} catch (replyErr) {
				// This happens when it took 15 minutes for cmd to error out 
				// and now can't reply to the interaction, log and don't followup
				console.error("Reply timed out. User wasn't made aware of above error");
				console.error(replyErr);
			}
			if (personId) await bdbot.endCooldown(commandName, personId);
		}
	}

	private async processCmd(interaction: ChatInputCommandInteraction, personId: Snowflake) {
        const {commandName, user, guildId} = interaction;
        
		console.log(`${commandName} command detected by: ${user.username}`);

		// const memberId = (guildId !== undefined) ? client.guilds.resolve(guildId)?.members?.resolve(user.id)?.id : undefined;
		if (await bdbot.isOnCooldown(commandName, personId, guildId)) {
			console.log("Command was NOT successful, member is on cooldown.");
			printSpace();
			await interaction.reply("Command was NOT successful, you are on cooldown for this command.");
			return;
		}

		// Initial cd to ensure the cmd isn't reissued while this instance
		// of the cmd is still executing
		await bdbot.putOnCooldown(commandName, personId);
		
		let result;
		if (result) {
			console.log(`${commandName} was successful`);
			client.executeInteraction(interaction);
			// TODO: How do we (un)assign cd's here without knowing true/false returned from cmd executing
		} else {
			console.error(`${commandName} was NOT successful`);
		}
	}

	private determinePersonId(member: GuildMember | APIGuildMember, guildId: Snowflake, userId: Snowflake): Snowflake {
		let personId: Snowflake;
		if (member instanceof GuildMember) {
			personId = member.id;
		} else if (guildId) {
			personId = client.guilds.resolve(guildId).members.resolve(userId).id
		} else {
			personId = userId;
		}

		if (personId === undefined) {
			throw new Error("Error: no member or user found for the interaction");
		}

		return personId;
	}
}
