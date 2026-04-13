import { StageChannel, VoiceBasedChannel, VoiceChannel } from "discord.js";

// Special helper function to absolutely ensure we aren't deleting important channel
export async function deleteVoiceChannel(channel: VoiceChannel | StageChannel) {
	// TODO: add additional check against critical channel ids (paranoid about deleting general lol)
	if (channel.isVoiceBased()) {
		await channel.delete();
	}
}

export function hasHumans(channel: VoiceBasedChannel): boolean {
	// trivial case
	if (channel.members.size === 0) {
		return false;
	}

	return channel.members.some((member) => !member.user.bot);
}
