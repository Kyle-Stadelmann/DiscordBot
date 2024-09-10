import { ArgsOf, Discord, On } from "discordx";
import { getVoiceConnection } from "@discordjs/voice";
import { GuildChannel } from "discord.js";
import { bdbot, client } from "../../app.js";

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class AloneDisconnect {
	@On({ event: "voiceStateUpdate" })
	private async tryAloneDisconnect([oldState, newState]: ArgsOf<"voiceStateUpdate">) {
		const guildId = oldState.guild.id;
		const connection = getVoiceConnection(guildId);

		if (!connection) return;

		const currBotChannelId = connection.joinConfig.channelId;
		// Guaranteed to be guild channel, bots can't connect to dm channels
		const currBotChannel = (await client.channels.fetch(currBotChannelId)) as GuildChannel;

		if (
			(oldState.channelId === currBotChannelId || newState.channelId === currBotChannelId) &&
			!currBotChannel.members.some((m) => !m.user.bot)
		) {
			if (connection) connection.destroy();
			const musicQueue = bdbot.player.queues.resolve(guildId);
			if (musicQueue) musicQueue.delete();
		}
	}
}
