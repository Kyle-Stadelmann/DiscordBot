import { StageChannel, VoiceChannel } from "discord.js";

// Special helper function to absolutely ensure we aren't deleting important channel
export async function deleteVoiceChannel(channel: VoiceChannel | StageChannel) {
	// TODO: add additional check against critical channel ids (paranoid about deleting general lol)
	if (channel.isVoice()) {
		await channel.delete();
	}
}
