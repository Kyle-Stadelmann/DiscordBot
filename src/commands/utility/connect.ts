import { getVoiceConnection, joinVoiceChannel } from "@discordjs/voice";
import { Category } from "@discordx/utilities";
import { CommandInteraction } from "discord.js";
import { Discord, Slash } from "discordx";
import { CommandCategory } from "../../types/command.js";

// TODO: make it so that this doesn't break music functions
@Discord()
@Category(CommandCategory.Utility)
export class ConnectCommand {
	@Slash({ name: "connect", description: "BDBot connects to the user's voice channel", dmPermission: false })
	async run(interaction: CommandInteraction): Promise<boolean> {
		if (getVoiceConnection(interaction.guildId)) {
			await interaction.reply({
				content: "Couldn't connect. I'm already connected to a channel!",
				ephemeral: true,
			});
			return false;
		}

		const { guild } = interaction;
		const member = await guild.members.fetch(interaction.user.id);
		const voiceChannel = member.voice?.channel;

		if (!voiceChannel || voiceChannel === guild.afkChannel) {
			await interaction.reply({
				content: "Couldn't connect. You're not in a valid voice channel!",
				ephemeral: true,
			});
			return false;
		}

		await interaction.reply(`Connecting to ***${voiceChannel.name}***...`);

		joinVoiceChannel({
			channelId: voiceChannel.id,
			guildId: voiceChannel.guildId,
			adapterCreator: guild.voiceAdapterCreator as any, // TODO remove any, temporary discord.js type problem ...
		});

		return true;
	}
}
