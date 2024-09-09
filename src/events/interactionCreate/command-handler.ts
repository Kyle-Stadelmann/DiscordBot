import { APIGuildMember, ChatInputCommandInteraction, GuildMember, Snowflake } from "discord.js";
import { ArgsOf, Discord, On } from "discordx";
import { bdbot, client } from "../../app.js";
import {
	createCmdErrorStr,
	createInteractionErrorStr,
	getCmdCooldownStrInteraction,
	isDevMode,
	isProdMode,
	printSpace,
	sendErrorToDiscordChannel,
} from "../../util/index.js";

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export abstract class CommandHandler {
	@On({ event: "interactionCreate" })
	private async handleCommand([interaction]: ArgsOf<"interactionCreate">) {
		if (!interaction.isChatInputCommand()) {
			try {
				await client.executeInteraction(interaction);
			} catch (error) {
				const errStr = createInteractionErrorStr(interaction, error);
				console.error(errStr);
				printSpace();

				if (isProdMode()) {
					await sendErrorToDiscordChannel(errStr);
				}
			}
			return;
		}

		const { user, guildId, member } = interaction;

		let personId;
		try {
			personId = this.determinePersonId(member, guildId, user.id);
			await this.processCmd(interaction, personId);
		} catch (error) {
			const cmdCooldownName = getCmdCooldownStrInteraction(interaction);

			const errStr = createCmdErrorStr(cmdCooldownName, error, interaction);
			console.error(errStr);
			printSpace();
			if (isProdMode()) {
				await sendErrorToDiscordChannel(errStr);
			}

			try {
				if (!interaction.replied && !interaction.deferred)
					await interaction.reply("Sorry, an error has occurred!");
				else await interaction.editReply("Sorry, an error has occurred!");
			} catch (replyErr) {
				// This happens when it took 15 minutes for cmd to error out
				// and now can't reply to the interaction, log and don't followup
				console.error("Reply timed out. User wasn't made aware of above error");
				console.error(replyErr);
			}
			if (personId) await bdbot.endCooldown(cmdCooldownName, personId);
		}
	}

	private async processCmd(interaction: ChatInputCommandInteraction, personId: Snowflake) {
		const { user, guildId } = interaction;

		const cmdCooldownName = getCmdCooldownStrInteraction(interaction);

		console.log(`${cmdCooldownName} command detected by: ${user.username}`);

		if ((await bdbot.isOnCooldown(cmdCooldownName, personId, guildId)) && !isDevMode()) {
			console.log("Command was NOT successful, member is on cooldown.");
			printSpace();
			await interaction.reply("Command was NOT successful, you are on cooldown for this command.");
			return;
		}

		// Initial cd to ensure the cmd isn't reissued while this instance
		// of the cmd is still executing
		await bdbot.putOnCooldown(cmdCooldownName, personId);

		const result = (await client.executeInteraction(interaction)) as boolean;
		if (result === true) {
			console.log(`${cmdCooldownName} was successful`);
			if (isDevMode()) await bdbot.endCooldown(cmdCooldownName, personId);
			else await bdbot.putOnCooldown(cmdCooldownName, personId);
		} else {
			console.log(`${cmdCooldownName} was NOT successful`);
			await bdbot.endCooldown(cmdCooldownName, personId);
		}
	}

	private determinePersonId(member: GuildMember | APIGuildMember, guildId: Snowflake, userId: Snowflake): Snowflake {
		let personId: Snowflake;
		if (member instanceof GuildMember) {
			personId = member.id;
		} else if (guildId) {
			personId = client.guilds.resolve(guildId).members.resolve(userId).id;
		} else {
			personId = userId;
		}

		if (personId === undefined) {
			throw new Error("Error: no member or user found for command interaction");
		}

		return personId;
	}
}
