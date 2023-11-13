import { ChatInputCommandInteraction } from "discord.js";

export function createCmdErrorStr(cmdName: string, error: Error, ci: ChatInputCommandInteraction): string {
	let errStr = `Error when executing command ${cmdName}\n`;
	errStr += `**msg**: ${JSON.stringify(ci)}\n\n`;
	errStr += `**error**: ${error.stack}\n\n`;
	return errStr;
}
