import { EmbedBuilder, ChatInputCommandInteraction, Interaction, TextChannel } from "discord.js";
import { GuardFunction } from "discordx";
import { client } from "../app.js";
import { DEV_SERVER_ERROR_CHANNEL } from "../constants.js";
import { isProdMode, printSpace } from "./index.js";

export function createCmdErrorStr(cmdName: string, error: unknown, ci: ChatInputCommandInteraction): string {
	let errStr = `**Error when executing command ${cmdName}**\n`;
	errStr += `**CommandInteraction**: ${ci.toString()}\n\n`;
	errStr += `**error**: ${error instanceof Error ? error.stack : JSON.stringify(error)}\n\n`;
	return errStr;
}

export function createInteractionErrorStr(interaction: Interaction, error: unknown): string {
	let errStr = `**Error when executing interaction**\n`;
	errStr += `**Interaction**: ${interaction.toString()}\n\n`;
	errStr += `**error**: ${error instanceof Error ? error.stack : JSON.stringify(error)}\n\n`;
	return errStr;
}

export function sendErrorToDiscordChannel(error: unknown) {
	const debugChannel = client.channels.resolve(DEV_SERVER_ERROR_CHANNEL) as TextChannel;
	const errStr = error instanceof Error ? error.stack ?? error.message : JSON.stringify(error);
	const errEmbed = new EmbedBuilder().setDescription(errStr);
	return debugChannel.send({ embeds: [errEmbed] });
}

export const ExceptionCatcher: GuardFunction = async (p, c, next, data) => {
	try {
		return await next();
	} catch (e: unknown) {
		// Don't print/notify for connection errors
		if (e instanceof Error && e.name === "ConnectTimeoutError") {
			return false;
		}
		let errStr = `**Error when executing event**\n`;
		errStr += `**params**: ${JSON.stringify(p)}\n\n`;
		errStr += `**data**: ${JSON.stringify(data)}\n\n`;
		errStr += `**error**: ${e instanceof Error ? e.stack : JSON.stringify(e)}\n\n`;
		console.error(errStr);
		printSpace();
		if (isProdMode()) await sendErrorToDiscordChannel(errStr);
		return false;
	}
};
