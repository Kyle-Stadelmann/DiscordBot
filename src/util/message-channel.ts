import { TextBasedChannel, EmbedBuilder } from "discord.js";
import { client } from "../app.js";
import { DEV_SERVER_ERROR_CHANNEL } from "../constants.js";

export function sendErrorToDiscordChannel(errStr: string) {
	const debugChannel = client.channels.resolve(DEV_SERVER_ERROR_CHANNEL) as TextBasedChannel;
	const errEmbed = new EmbedBuilder().setDescription(errStr);
	return debugChannel.send({ embeds: [errEmbed] });
}
