import { Message, MessageEmbed, TextBasedChannel } from "discord.js";
import { client } from "../app.js";
import { DEV_SERVER_ERROR_CHANNEL } from "../constants.js";

export function sendErrorMessage(channel: TextBasedChannel, msg: string): Promise<Message> {
	return channel.send(msg);
}

export function sendMessage(channel: TextBasedChannel, msg: string): Promise<Message> {
	return channel.send(msg);
}

export function sendEmbeds(channel: TextBasedChannel, embeds: MessageEmbed[], text?: string): Promise<Message> {
	return channel.send({ embeds, content: text });
}

export function sendErrorToDiscordChannel(errStr: string) {
	const debugChannel = client.channels.resolve(DEV_SERVER_ERROR_CHANNEL) as TextBasedChannel;
	const errEmbed = new MessageEmbed({ description: errStr });
	return debugChannel.send({ embeds: [errEmbed] });
}
