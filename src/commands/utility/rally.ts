import {
	ApplicationCommandOptionType,
	Collection,
	CommandInteraction,
	Guild,
	PermissionFlagsBits,
	Role,
	StageChannel,
	VoiceChannel,
	VoiceBasedChannel,
} from "discord.js";
import { Category } from "@discordx/utilities";
import { Discord, Slash, SlashChoice, SlashOption } from "discordx";
import { CommandCategory } from "../../types/command.js";

@Discord()
@Category(CommandCategory.Utility)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class RallyCommand {
	@Slash({
		name: "rally",
		description: "Brings all users connected to voice to the voice channel that the user is in",
		dmPermission: false,
	})
	async run(
		@SlashOption({
			name: "role",
			description: "Role to pull to you",
			required: false,
			type: ApplicationCommandOptionType.Role,
		})
		role: Role | undefined,
		@SlashChoice({ name: "to me", value: true })
		@SlashOption({
			name: "pull-to-hidden",
			description: "To you? Leave empty if you don't know what this is",
			required: false,
			type: ApplicationCommandOptionType.Boolean,
		})
		pullToHiddenChannel: boolean | undefined,
		interaction: CommandInteraction
	): Promise<boolean> {
		const { guild } = interaction;
		const member = await guild.members.fetch(interaction.user.id);
		const callerVoiceChannel = member.voice?.channel;
		const shouldPullToHidden = pullToHiddenChannel ?? false;

		await interaction.deferReply({ ephemeral: shouldPullToHidden });

		if (!callerVoiceChannel) {
			await interaction.editReply("Rally failed, caller is not in a valid voice channel");
			return false;
		}

		const isCallerChannelPublic = callerVoiceChannel
			.permissionsFor(guild.roles.everyone)
			.has(PermissionFlagsBits.ViewChannel);

		if (callerVoiceChannel === guild.afkChannel || (!isCallerChannelPublic && !shouldPullToHidden)) {
			await interaction.editReply("Rally failed, caller is not in a valid voice channel");
			return false;
		}
		const validChannels = this.getValidRallyChannels(guild, callerVoiceChannel, shouldPullToHidden);

		if (validChannels.size <= 0) {
			await interaction.editReply("Rally failed, no valid voice channels");
			return false;
		}

		const canRallyAnyMembers = validChannels.some((vChannel) => {
			if (!role) return vChannel.members.size > 0;

			return vChannel.members.some((chMember) => chMember.roles.cache.has(role.id));
		});

		if (!canRallyAnyMembers) {
			await interaction.editReply("Rally failed, no users to Rally with");
			return false;
		}

		await interaction.editReply(`Initiating rally on ${callerVoiceChannel.name}.`);

		this.performRallyMovement(validChannels, callerVoiceChannel, role, member.id);

		await interaction.followUp({ content: "Rally completed", ephemeral: shouldPullToHidden });

		return true;
	}

	private getValidRallyChannels(
		guild: Guild,
		callerVoiceChannel: VoiceBasedChannel,
		shouldPullToHidden: boolean
	): Collection<string, VoiceChannel | StageChannel> {
		const validChannels = new Collection<string, VoiceChannel | StageChannel>();

		guild.channels.cache.forEach((userChannel) => {
			const isPublicChannel = userChannel.permissionsFor(guild.roles.everyone).has(PermissionFlagsBits.ViewChannel);
			const isAfkChannel = guild.afkChannel && userChannel.id === guild.afkChannel.id;
			const isCallerChannel = userChannel.id === callerVoiceChannel.id;

			if (!isAfkChannel && !isCallerChannel && userChannel.isVoiceBased() && (isPublicChannel || shouldPullToHidden)) {
				validChannels.set(userChannel.id, userChannel);
			}
		});

		return validChannels;
	}

	private performRallyMovement(
		validChannels: Collection<string, VoiceChannel | StageChannel>,
		destinationChannel: VoiceBasedChannel,
		role: Role | undefined,
		callerId: string
	) {
		validChannels.forEach((userChannel) => {
			userChannel.members.forEach((chMember) => {
				if (chMember.id === callerId) return;

				if (!role || chMember.roles.cache.has(role.id)) {
					console.log(`Moving user with ID: ${chMember.id}`);
					chMember.edit({ channel: destinationChannel }).catch((error) => {
						console.error(error);
					});
				}
			});
		});
	}
}
