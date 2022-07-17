import { Message, MessageEmbed, TextBasedChannel } from "discord.js";

export function sendErrorMessage(channel: TextBasedChannel, msg: string): Promise<Message> {
	return channel.send(msg);
}

export function sendMessage(channel: TextBasedChannel, msg: string): Promise<Message> {
	return channel.send(msg);
}

export function sendEmbeds(channel: TextBasedChannel, embeds: MessageEmbed[], text?: string): Promise<Message> {
	return channel.send({ embeds, content: text });
}
