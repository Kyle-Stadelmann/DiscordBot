import { CommandInteraction, Guild, PermissionFlagsBits, StageChannel, VoiceChannel } from "discord.js";
import { Category } from "@discordx/utilities";
import { Discord, Slash } from "discordx";
import { CommandCategory } from "../../types/command.js";
import { getRandomElement } from "../../util/index.js";
import { CooldownTime } from "../../types/cooldown-time.js";

@Discord()
@Category(CommandCategory.Fun)
@CooldownTime(60 * 60 * 1000)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ScrambleCommand {
	@Slash({ name: "scramble", description: "Sends everyone in your channel to a random channel", dmPermission: false })
	async run(interaction: CommandInteraction): Promise<boolean> {
		const { guild } = interaction;
		const member = await guild.members.fetch(interaction.user.id);
		const startChannel = member.voice?.channel;

		if (!startChannel || guild.afkChannel === startChannel) {
			await interaction.reply({
				content: "Scramble failed because you are not in a valid voice channel!",
				ephemeral: true,
			});
			return false;
		}

		const validChannels = this.getValidChannels(guild, startChannel);
		if (validChannels.length === 0) {
			await interaction.reply({
				content: "Scramble failed because there are no valid, visible voice channels.",
				ephemeral: true,
			});
			return false;
		}

		await interaction.reply({ content: `Initiating channel scramble on *${startChannel.name}*.` });

		await this.moveChannelMembers(startChannel, validChannels);

		await interaction.reply({ content: "Channel scramble completed!" });

		return true;
	}

	private async moveChannelMembers(
		startChannel: VoiceChannel | StageChannel,
		destinationChannels: (VoiceChannel | StageChannel)[]
	) {
		const channelMembers = startChannel.members.toJSON();

		const promises = channelMembers.flatMap((victim) => {
			const randomChannel = getRandomElement(destinationChannels);
			if (victim.voice.channel) {
				return [victim.edit({ channel: randomChannel })];
			}
			return [];
		});
		await Promise.all(promises);
	}

	// Gets all valid channels
	// (channels that are voice, another channel than current, that everyone can see, and that aren't afk)
	private getValidChannels(guild: Guild, voiceChannel: VoiceChannel | StageChannel): (VoiceChannel | StageChannel)[] {
		const validChannels: (VoiceChannel | StageChannel)[] = [];

		guild.channels.cache.forEach((channel) => {
			const notAfkChannel = guild.afkChannel !== channel;
			const perm = channel.permissionsFor(guild.roles.everyone).has(PermissionFlagsBits.ViewChannel);
			if (channel.isVoiceBased() && channel.id !== voiceChannel.id && perm && notAfkChannel) {
				validChannels.push(channel);
			}
		});

		return validChannels;
	}
}
