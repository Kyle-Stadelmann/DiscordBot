/* eslint-disable no-param-reassign */
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
	User,
} from "discord.js";
import { ButtonComponent, Discord, Slash, SlashOption } from "discordx";
import { CommandCategory } from "../../types/command.js";
import { CooldownTime } from "../../types/cooldown-time.js";
import { Activity, createActivity, getActivity } from "../../types/data-access/activity.js";

const DEFAULT_SIZES = new Map([
	["skowhen", 5],
	["owhen", 5],
	["valhen", 5],
	["apexhen", 3],
]);

const DEFAULT_EXPIRE = 90 * 60 * 1000;

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
		sizeParam: number | undefined,
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

		const { user } = interaction;
		const guildId = interaction.guild.id;
		const activityName = role?.name.toLowerCase() ?? name;
		const size = sizeParam ?? DEFAULT_SIZES.get(activityName);
		const expire = new Date(new Date().getTime() + DEFAULT_EXPIRE);

		let activity = await getActivity(guildId, activityName);

		if (activity !== undefined && activity.expire > new Date()) {
			await interaction.reply(
				`An active ${activityName} queue already exists, please attempt to join that instead.`
			);
			return false;
		}

		if (activity === undefined) {
			activity = await createActivity(guildId, activityName, [user.id], size, expire);
		} else {
			activity.participantIds = [user.id];
			activity.size = size;
			activity.expire = expire;
			await activity.save();
		}

		const aActivityStr = `a${["a", "e", "i", "o", "u"].includes(activityName.charAt(0)) ? "n" : ""} ${activityName}`;

		const embed = new EmbedBuilder()
			.setTitle(`${activityName}`)
			.setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.avatarURL() })
			.setDescription(
				`${user.toString()} has created ${aActivityStr} queue. Use the buttons below to join, leave, or subscribe to the ${activityName} queue!`
			);

		const btnRow = this.createButtonRow(guildId, activityName);

		await interaction.reply({ embeds: [embed], components: [btnRow] });
		return true;
	}

	createButtonRow(guildId: string, activityName: string) {
		const joinBtn = new ButtonBuilder()
			.setLabel("Join")
			.setStyle(ButtonStyle.Success)
			.setCustomId(`hen_join_${guildId}_${activityName}`);
		const leaveBtn = new ButtonBuilder()
			.setLabel("Leave")
			.setStyle(ButtonStyle.Danger)
			.setCustomId(`hen_leave_${guildId}_${activityName}`);
		const subscribeBtn = new ButtonBuilder()
			.setLabel("Subscribe")
			.setStyle(ButtonStyle.Primary)
			.setCustomId(`hen_subscribe_${guildId}_${activityName}`);

		return new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(joinBtn, leaveBtn, subscribeBtn);
	}

	@ButtonComponent({ id: /hen_.*_.*_.*/ })
	async handleBtns(interaction: ButtonInteraction) {
		const { user } = interaction;
		const userId = user.id;
		const [, action, guildId, name] = interaction.customId.split("_");
		const activity = await getActivity(guildId, name);

		if (activity === undefined) {
			console.error(
				`Userid=${userId} couldn't ${action} activity=${name} for guildId=${guildId}. DB Activity was undefined`
			);
			await interaction.reply({
				content: "Sorry this action failed. Internal bot error. Please report this.",
				ephemeral: true,
			});
			return;
		}

		if (action === "subscribe") {
			await this.handleSubscribe(interaction, activity, user, name);
		} else if (action === "join") {
			await this.handleJoin(interaction, activity, user, name);
		} else {
			await this.handleLeave(interaction, activity, user, name);
		}
	}

	async handleJoin(interaction: ButtonInteraction, activity: Activity, user: User, name: string) {
		const userId = user.id;
		if (activity.participantIds.includes(userId)) {
			await interaction.reply({ content: "You've already joined this activity!", ephemeral: true });
		} else if (activity.participantIds.length >= activity.size) {
			await interaction.reply({
				content:
					"Sorry this queue is already full. Please wait or ask a participating member to switch with you.",
				ephemeral: true,
			});
		} else {
			activity.participantIds.push(userId);
			await activity.save();
			await interaction.reply(`${user.toString()} has joined the ***${name}*** queue`);
		}
	}

	async handleLeave(interaction: ButtonInteraction, activity: Activity, user: User, name: string) {
		const userId = user.id;
		if (activity.participantIds.includes(userId)) {
			activity.participantIds = activity.participantIds.filter((id) => id !== userId);
			await activity.save();
			await interaction.reply(`${user.toString()} has left the ***${name}*** queue`);
		} else {
			await interaction.reply({ content: "You haven't joined this activity!", ephemeral: true });
		}
	}

	async handleSubscribe(interaction: ButtonInteraction, activity: Activity, user: User, name: string) {
		const userId = user.id;
		if (activity.subscriberIds.includes(userId)) {
			activity.subscriberIds = activity.subscriberIds.filter((id) => id !== userId);
			await activity.save();
			await interaction.reply({
				content: `You've unsubscribed from the ***${name}*** activity! You will no longer receive notifications.`,
				ephemeral: true,
			});
		} else {
			activity.subscriberIds.push(userId);
			await activity.save();
			await interaction.reply({
				content: `You've subscribed to the ***${name}*** activity! You will receive a DM notification whenever this activity is hen'd in the future. Click again to unsubscribe.`,
				ephemeral: true,
			});
		}
	}
}
