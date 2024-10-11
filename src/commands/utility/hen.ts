import { Category } from "@discordx/utilities";
import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder, Role } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { CommandCategory } from "../../types/command.js";
import { CooldownTime } from "../../types/cooldown-time.js";
import { WHITE_CHECK_MARK, X_MARK } from "../../constants.js";

@Discord()
@Category(CommandCategory.Utility)
@CooldownTime(30 * 1000)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class HenCommand {
	@Slash({
		name: "hen",
		description: "Starts a 'queue' to help find people interested in a specified activity",
		dmPermission: false,
	})
	async run(
		@SlashOption({
			name: "activity",
			description: "The activity you want to start a queue for",
			type: ApplicationCommandOptionType.Role,
		})
		activity: Role | undefined,
		@SlashOption({
			name: "activity2",
			description: "The activity (when no role is associated) you want to start a queue for",
			type: ApplicationCommandOptionType.String,
		})
		activity2: string | undefined,
		@SlashOption({
			name: "size",
			description: "The max number of people allowed (default: no max)",
			type: ApplicationCommandOptionType.Integer,
		})
		size: number | undefined,
		@SlashOption({
			name: "time",
			description: "The time you would like to start the activity",
			type: ApplicationCommandOptionType.String,
		})
		time: string | undefined,
		interaction: CommandInteraction
	): Promise<boolean> {
		if (activity === undefined && activity2 === undefined) {
			await interaction.reply({
				content: "Command was NOT successful, no role or text for the activity was specified.",
				ephemeral: true,
			});
			return false;
		}

		const activityStr = activity?.name ?? activity2;

		const embed = new EmbedBuilder()
			.setTitle(`${activityStr}`)
			.setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.avatarURL() })
			.setDescription(
				`A ${activityStr} queue has been initiated. React with ${WHITE_CHECK_MARK} to join, or react with ${X_MARK} to leave the queue!`
			);

		await interaction.reply({ embeds: [embed] });
		return true;
	}
}
