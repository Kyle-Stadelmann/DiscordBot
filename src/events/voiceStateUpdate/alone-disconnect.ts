import { ArgsOf, Discord, On } from "discordx";
import { getVoiceConnection } from "@discordjs/voice";
import { VoiceBasedChannel } from "discord.js";
import { bdbot, client } from "../../app.js";
import { hasHumans } from "../../util/voice-channel.js";

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class AloneDisconnect {
	@On({ event: "voiceStateUpdate" })
	private async tryAloneDisconnect([oldState, newState]: ArgsOf<"voiceStateUpdate">) {
		const guildId = oldState.guild.id;
		const connection = getVoiceConnection(guildId);

		if (!connection) return;

		const currBotChannelId = connection.joinConfig.channelId;
		// Guaranteed to be guild voice channel, bots can't connect otherwise
		const currBotChannel = (await client.channels.fetch(currBotChannelId)) as VoiceBasedChannel;

		if (
			(oldState.channelId === currBotChannelId || newState.channelId === currBotChannelId) &&
			!hasHumans(currBotChannel)
		) {
			if (connection) connection.destroy();
			const musicQueue = bdbot.player.queues.resolve(guildId);
			if (musicQueue) musicQueue.delete();
		}
	}
}
