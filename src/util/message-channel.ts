import { TextBasedChannel, EmbedBuilder, ChatInputCommandInteraction, Interaction } from "discord.js";
import { client } from "../app.js";
import { DEV_SERVER_ERROR_CHANNEL } from "../constants.js";

export function createCmdErrorStr(cmdName: string, error: Error, ci: ChatInputCommandInteraction): string {
	let errStr = `Error when executing command ${cmdName}\n`;
	errStr += `**CommandInteraction**: ${ci.toString()})\n\n`;
	errStr += `**error**: ${error.stack}\n\n`;
	return errStr;
}

export function createInteractionErrorStr(interaction: Interaction, error: Error): string {
	let errStr = `Error when executing interaction\n`;
	errStr += `**Interaction**: ${interaction.toString()}\n\n`;
	errStr += `**error**: ${error.stack}\n\n`;
	return errStr;
}

export function sendErrorToDiscordChannel(errStr: string) {
	const debugChannel = client.channels.resolve(DEV_SERVER_ERROR_CHANNEL) as TextBasedChannel;
	const errEmbed = new EmbedBuilder().setDescription(errStr);
	return debugChannel.send({ embeds: [errEmbed] });
}
