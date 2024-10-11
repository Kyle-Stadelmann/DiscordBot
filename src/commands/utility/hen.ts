import { Category } from "@discordx/utilities";
import {
	ActionRowBuilder,
	ApplicationCommandOptionType,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	CommandInteraction,
	EmbedBuilder,
	MessageActionRowComponentBuilder,
	Role,
} from "discord.js";
import { ButtonComponent, Discord, Slash, SlashOption } from "discordx";
import { CommandCategory } from "../../types/command.js";
import { CooldownTime } from "../../types/cooldown-time.js";
import { getActivity } from "../../types/data-access/hen.js";

@Discord()
@Category(CommandCategory.Utility)
@CooldownTime(30 * 1000)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class HenCommand {
	@Slash({
		name: "hen",
		description: "Starts an activity 'queue' to help find people interested in joining",
		dmPermission: false,
	})
	async run(
		@SlashOption({
			name: "role",
			description: "The role activity you want to start a queue for",
			type: ApplicationCommandOptionType.Role,
		})
		role: Role | undefined,
		@SlashOption({
			name: "name",
			description: "The name of the activity (when no role is associated) you want to start a queue for",
			type: ApplicationCommandOptionType.String,
		})
		name: string | undefined,
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
		if (role === undefined && name === undefined) {
			await interaction.reply({
				content: "Command was NOT successful, no role or text for the activity was specified.",
				ephemeral: true,
			});
			return false;
		}

		const guildId = interaction.guild.id;
		const activityStr = role?.name ?? name;

		const embed = new EmbedBuilder()
			.setTitle(`${activityStr}`)
			.setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.avatarURL() })
			.setDescription(
				`A ${activityStr} queue has been initiated. Use the buttons below to join, leave, or subscribe to the ${activityStr} queue!`
			);

		const joinBtn = new ButtonBuilder()
			.setLabel("Join")
			.setStyle(ButtonStyle.Success)
			.setCustomId(`join_${guildId}_${activityStr}`);
		const leaveBtn = new ButtonBuilder()
			.setLabel("Leave")
			.setStyle(ButtonStyle.Danger)
			.setCustomId(`leave_${guildId}_${activityStr}`);
		const subscribeBtn = new ButtonBuilder()
			.setLabel("Subscribe")
			.setStyle(ButtonStyle.Primary)
			.setCustomId(`subscribe_${guildId}_${activityStr}`);

		const btnRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
			joinBtn,
			leaveBtn,
			subscribeBtn
		);

		await interaction.reply({ embeds: [embed], components: [btnRow] });
		return true;
	}

	@ButtonComponent({ id: /join_.*_.*/ })
	async join(interaction: ButtonInteraction) {
		const [, guildId, name] = interaction.customId.split("_");
		await interaction.reply(`Joining ${guildId} ${name}`);
	}

	@ButtonComponent({ id: /leave_.*_.*/ })
	async leave(interaction: ButtonInteraction) {
		const [, guildId, name] = interaction.customId.split("_");
		await interaction.reply(`Leaving ${guildId} ${name}`);
	}

	@ButtonComponent({ id: /subscribe.*_.*/ })
	async subscribe(interaction: ButtonInteraction) {
		const userId = interaction.user.id;
		const [, guildId, name] = interaction.customId.split("_");
		const activity = await getActivity(guildId, name);

		if (activity.participantIds.includes(userId)) {
			activity.participantIds = activity.participantIds.filter((id) => id !== userId);
			await activity.save();
			await interaction.reply({
				content: `You've unsubscribed from the ***${name}*** activity! You will no longer receive notifications.`,
				ephemeral: true,
			});
		} else {
			activity.participantIds.push(userId);
			await activity.save();
			await interaction.reply({
				content: `You've been subscribed to the ***${name}*** activity! You will receive a DM notification whenever this activity is hen'd. Click again to unsubscribe.`,
				ephemeral: true,
			});
		}
	}
}
