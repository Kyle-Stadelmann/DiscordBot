import {
	ApplicationCommandOptionType,
	Collection,
	CommandInteraction,
	PermissionFlagsBits,
	Role,
	StageChannel,
	VoiceChannel,
} from "discord.js";
import { Category } from "@discordx/utilities";
import { Discord, Slash, SlashChoice, SlashOption } from "discordx";
import { CommandCategory } from "../../types/command.js";

// TODO: Add back ability to add multiple roles
// (seems impossible to do variable number of roles like before though)
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
			name: "where",
			description: "To you? Leave empty if you don't know what this is",
			required: false,
			type: ApplicationCommandOptionType.Boolean,
		})
		where: boolean | undefined,
		interaction: CommandInteraction
	): Promise<boolean> {
		const rolesToCall = role ? [role] : [];
		const { guild } = interaction;
		const member = await guild.members.fetch(interaction.user.id);
		const voiceChannel = member.voice?.channel;
		// Pull to hidden channel
		const pullToHidden = where ?? false;

		// Don't broadcast if target channel is hidden
		await interaction.deferReply({ ephemeral: pullToHidden });

		// Confirm that user called from a voice channel
		if (!voiceChannel) {
			await interaction.editReply("Rally failed, caller is not in a valid voice channel");
			return false;
		}

		// List of channels that can be taken from
		const validChannels = new Collection<string, VoiceChannel | StageChannel>();
		// Whether or not user's channel is public
		const publicChannel = voiceChannel.permissionsFor(guild.roles.everyone).has(PermissionFlagsBits.ViewChannel);

		// Check if called from valid voice channel
		if (voiceChannel === guild.afkChannel || (!publicChannel && !pullToHidden)) {
			await interaction.editReply("Rally failed, caller is not in a valid voice channel");
			return false;
		}

		// Go through each voice channel and establish whether or not it's valid
		guild.channels.cache.forEach((userChannel) => {
			const perm = userChannel.permissionsFor(guild.roles.everyone).has(PermissionFlagsBits.ViewChannel);
			if (
				!(guild.afkChannel && userChannel.id === guild.afkChannel.id) &&
				userChannel.id !== member.voice.channel.id &&
				userChannel.isVoiceBased() &&
				perm
			) {
				validChannels.set(userChannel.id, userChannel);
			}
		});

		// Check for a valid channel
		if (validChannels.size <= 0) {
			await interaction.editReply("Rally failed, no valid voice channels");
			return false;
		}

		// Check for a valid member (rally is successful as long as there is one member in one valid channel)
		const areValidMembers = !validChannels.some((vChannel) =>
			vChannel.members.some((chMember) => {
				if (rolesToCall.length === 0) return true;

				return rolesToCall.some((membRole) => chMember.roles.cache.has(membRole.id));
			})
		);

		if (areValidMembers) {
			await interaction.editReply("Rally failed, no users to Rally with");
			return false;
		}

		await interaction.editReply(`Initiating rally on ${voiceChannel.name}.`);

		// Move all valid users to caller's voice channel
		validChannels.forEach((userChannel) => {
			userChannel.members.forEach((chMember) => {
				// size of roles list && whether any entry in roles list overlaps with user's roles
				if (
					!(rolesToCall.length > 0 && !rolesToCall.some((userRole) => chMember.roles.cache.has(userRole.id)))
				) {
					console.log(`Moving user with ID: ${member.id}`);
					chMember.edit({ channel: voiceChannel }).catch((error) => {
						console.error(error);
					});
				}
			});
		});

		await interaction.followUp({ content: "Rally completed", ephemeral: pullToHidden });

		return true;
	}
}
