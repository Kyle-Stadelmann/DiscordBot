/* eslint-disable no-param-reassign */
import { Category } from "@discordx/utilities";
import {
	ActionRowBuilder,
	ApplicationCommandOptionType,
	BaseMessageOptions,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	CommandInteraction,
	EmbedBuilder,
	Guild,
	MessageActionRowComponentBuilder,
	Role,
	User,
} from "discord.js";
import { ButtonComponent, Discord, Slash, SlashOption } from "discordx";
import { CommandCategory } from "../../types/command.js";
import { CooldownTime } from "../../types/cooldown-time.js";
import { Activity, createActivity, endActivity, getActivity } from "../../types/data-access/activity.js";
import { client } from "../../app.js";
import { tryDM } from "../../util/message-helper.js";

const DEFAULT_SIZES = new Map([
	["skowhen", 5],
	["owhen", 5],
	["valhen", 5],
	["apexhen", 3],
]);

const DEFAULT_EXPIRE = 1 * 60 * 1000;

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

		const { user, guild } = interaction;
		const guildId = guild.id;
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

		activity = await this.updateActivity(activity, guildId, user.id, size, expire, activityName);

		const henResponse = this.createHenResponse(user, guild, activityName);

		await interaction.reply(henResponse);

		const interactionLink = `https://discord.com/channels/${guildId}/${interaction.channelId}/${interaction.id}`;
		const dmMsg = this.createDMMessage(user, guild, activityName, interactionLink);
		await this.notifySubscribers(
			activity.subscriberIds.filter((id) => id === user.id),
			dmMsg
		);
		return true;
	}

	async updateActivity(
		activity: Activity,
		guildId: string,
		userId: string,
		size: number,
		expire: Date,
		name: string
	) {
		let newActivity: Activity;
		if (activity === undefined) {
			newActivity = await createActivity(guildId, name, [userId], size, expire);
		} else {
			activity.participantIds = [userId];
			activity.size = size;
			activity.expire = expire;
			await activity.save();
			newActivity = activity;
		}
		return newActivity;
	}

	createHenResponse(user: User, guild: Guild, activityName: string) {
		const aActivityStr = `a${["a", "e", "i", "o", "u"].includes(activityName.charAt(0)) ? "n" : ""} ${activityName}`;

		const embed = new EmbedBuilder()
			.setTitle(`${activityName}`)
			.setAuthor({ name: user.displayName, iconURL: user.avatarURL() })
			.setDescription(
				`${user.toString()} has created ${aActivityStr} queue. Use the buttons below to join, leave, or subscribe to the ${activityName} queue!`
			)
			.setFooter({ text: guild.name, iconURL: guild.iconURL() });

		const btnRow = this.createHenButtonRow(guild.id, activityName);
		const response: BaseMessageOptions = { embeds: [embed], components: [btnRow] };
		return response;
	}

	createHenButtonRow(guildId: string, activityName: string) {
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

	createDMMessage(user: User, guild: Guild, activityName: string, interactionLink: string) {
		const aActivityStr = `a${["a", "e", "i", "o", "u"].includes(activityName.charAt(0)) ? "n" : ""} ${activityName}`;
		const embed = new EmbedBuilder()
			.setTitle(`${activityName}`)
			.setAuthor({ name: user.displayName, iconURL: user.avatarURL() })
			.setDescription(
				`${user.toString()} has created ${aActivityStr} queue: ${interactionLink}. Use the button below to unsubscribe/subscribe to the ${activityName} queue.`
			)
			.setFooter({ text: guild.name, iconURL: guild.iconURL() });

		const btnRow = this.createDMButtonRow(guild.id, activityName);
		const response: BaseMessageOptions = { embeds: [embed], components: [btnRow] };
		return response;
	}

	createDMButtonRow(guildId: string, activityName: string) {
		const subscribeBtn = new ButtonBuilder()
			.setLabel("Subscribe")
			.setStyle(ButtonStyle.Primary)
			.setCustomId(`hen_subscribe_${guildId}_${activityName}`);

		return new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(subscribeBtn);
	}

	async notifySubscribers(subscribers: string[], subscriberMsg: BaseMessageOptions) {
		const promises = subscribers.map((userId) => this.tryNotifySubscriber(userId, subscriberMsg));
		await Promise.all(promises);
	}

	async tryNotifySubscriber(userId: string, subscriberMsg: BaseMessageOptions) {
		const user = await client.users.fetch(userId);
		await tryDM(user, subscriberMsg);
	}

	@ButtonComponent({ id: /hen_.*_.*_.*/ })
	async handleBtns(interaction: ButtonInteraction) {
		const { user } = interaction;
		const userId = user.id;
		const [, action, guildId, name] = interaction.customId.split("_");
		const activity = await getActivity(guildId, name);

		if (activity === undefined) {
			console.error(
				`Userid=${userId} couldn't ${action} activity=${name} for guildId=${guildId}. DB activity was undefined`
			);
			await interaction.reply({
				content: "This action failed. Internal bot error. Please report this.",
				ephemeral: true,
			});
			return;
		}

		if (action === "subscribe") {
			await this.handleSubscribe(interaction, activity, user);
		} else {
			if (activity.expire <= new Date()) {
				await interaction.reply({
					content: "This action failed. This queue has expired. Please recreate it with `/hen`.",
					ephemeral: true,
				});
				return;
			}
			if (action === "join") {
				await this.handleJoin(interaction, activity, user);
			} else {
				await this.handleLeave(interaction, activity, user);
			}
		}
	}

	async handleJoin(interaction: ButtonInteraction, activity: Activity, user: User) {
		const userId = user.id;
		if (activity.participantIds.includes(userId)) {
			await interaction.reply({ content: "You've already joined this activity!", ephemeral: true });
		} else if (activity.participantIds.length >= activity.size) {
			await interaction.reply({
				content: "This queue is already full. Please wait or ask a participating member to switch with you.",
				ephemeral: true,
			});
		} else {
			activity.participantIds.push(userId);
			await activity.save();

			if (activity.participantIds.length === activity.size) {
				await this.handleFilledQueue(interaction, activity, user);
			} else {
				await interaction.reply(`${user.toString()} has joined the ***${activity.name}*** queue`);
			}
		}
	}

	async handleFilledQueue(interaction: ButtonInteraction, activity: Activity, user: User) {
		await interaction.reply(
			`${user.toString()} has joined the ***${activity.name}*** queue\n\nThis queue is now full.`
		);
	}

	async handleLeave(interaction: ButtonInteraction, activity: Activity, user: User) {
		const userId = user.id;
		if (activity.participantIds.includes(userId)) {
			activity.participantIds = activity.participantIds.filter((id) => id !== userId);
			await activity.save();

			if (activity.participantIds.length === 0) {
				await this.handleEmptyQueue(interaction, activity, user);
			} else {
				await interaction.reply(`${user.toString()} has left the ***${activity.name}*** queue`);
			}
		} else {
			await interaction.reply({ content: "You haven't joined this activity!", ephemeral: true });
		}
	}

	async handleEmptyQueue(interaction: ButtonInteraction, activity: Activity, user: User) {
		await interaction.reply(
			`${user.toString()} has left the ***${activity.name}*** queue\nThis queue is now empty and will be deleted. Use \`/hen\` to create another queue.`
		);
		await endActivity(activity);
	}

	async handleSubscribe(interaction: ButtonInteraction, activity: Activity, user: User) {
		const userId = user.id;
		if (activity.subscriberIds.includes(userId)) {
			activity.subscriberIds = activity.subscriberIds.filter((id) => id !== userId);
			await activity.save();
			await interaction.reply({
				content: `You've unsubscribed from the ***${activity.name}*** activity! You will no longer receive notifications.`,
				ephemeral: true,
			});
		} else {
			activity.subscriberIds.push(userId);
			await activity.save();
			await interaction.reply({
				content: `You've subscribed to the ***${activity.name}*** activity! You will receive a DM notification whenever this activity is hen'd in the future. Click again to unsubscribe.`,
				ephemeral: true,
			});
		}
	}
}
