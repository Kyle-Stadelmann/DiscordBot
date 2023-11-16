import { TextBasedChannel, EmbedBuilder, ChatInputCommandInteraction, Interaction } from "discord.js";
import { GuardFunction } from "discordx";
import { client } from "../app.js";
import { DEV_SERVER_ERROR_CHANNEL } from "../constants.js";
import { isProdMode, printSpace } from "./index.js";

export function createCmdErrorStr(cmdName: string, error: Error, ci: ChatInputCommandInteraction): string {
	let errStr = `**Error when executing command ${cmdName}\n**`;
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

export const ExceptionCatcher: GuardFunction = async (p, c, next) => {
	try {
		return await next();
	} catch (e) {
		console.error(e);
		printSpace();
		if (isProdMode()) await sendErrorToDiscordChannel(e.stack);
		return false;
	}
};