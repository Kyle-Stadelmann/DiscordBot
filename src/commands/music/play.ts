import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { PlayerNodeInitializationResult } from "discord-player";
import { Discord, Slash, SlashOption } from "discordx";
import { Category } from "@discordx/utilities";
import { bdbot, client } from "../../app.js";
import { CommandCategory } from "../../types/command.js";
import { createNpString, queueSong } from "../../util/index.js";

// TODO: this breaks if connect was used prior

@Discord()
@Category(CommandCategory.Music)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class PlayCommand {
	@Slash({ name: "play", description: "Add a track to the queue or resume the current track", dmPermission: false })
	public async run(
		@SlashOption({
			name: "query",
			description: "Search query or music link to add to the queue",
			required: false,
			type: ApplicationCommandOptionType.String,
		})
		query: string | undefined,
		interaction: CommandInteraction
	): Promise<boolean> {
		await interaction.deferReply();
		const queue = bdbot.player.queues.resolve(interaction.guildId);
		const { guild } = interaction;
		const member = await guild.members.fetch(interaction.user.id);
		const voiceChannel = member.voice.channel;

		if (!voiceChannel || voiceChannel === guild.afkChannel) {
			await interaction.editReply("Music command failed. Please join a channel first!");
			return false;
		}

		// argless play (functionally unpause)
		if (!query) {
			queue.node.setPaused(false);

			const npmsg = createNpString(queue);

			await interaction.editReply(npmsg);
			return true;
		}

		let result: PlayerNodeInitializationResult;
		try {
			result = await queueSong(voiceChannel, query, interaction.channel, member.user);
		} catch (e) {
			await interaction.editReply(
				"Music command failed. Was unable to queue song, are you connected to a channel?"
			);
			console.error(e);
			return false;
		}

		const { tracks } = result.searchResult;

		if (result.track.playlist) {
			await interaction.editReply(`Added playlist ${result.searchResult.playlist?.title} to the queue.`);
		} else {
			await interaction.editReply(`${tracks[0].title} by ${tracks[0].author} has been added to the queue.`);
		}
		return true;
	}
}
