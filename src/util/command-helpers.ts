import { Message, EmbedBuilder, CommandInteraction } from "discord.js";
import path from "path";
import { PREFIX } from "../constants.js";
import { Command } from "../types/command.js";
import { ParentCommand } from "../types/parent-command.js";
import { isDevMode } from "./settings-helpers.js";
import { sendEmbeds } from "./message-channel.js";
import { printSpace } from "./print-space.js";

export async function loadCommandFile(file: string): Promise<Command> {
	const cmd = (await import(`file://${file}`)).default as Command;

	// Only load command if its not disabled
	// But if DEV mode is activated, load disabled commands
	if (!cmd.disabled || isDevMode()) {
		console.log(`${path.basename(file)} loaded!`);
		return cmd;
	}
	return null;
}

export async function loadCommandFiles(files: string[]): Promise<Command[]> {
	if (files.length === 0) {
		console.log("No commands to load!");
		return [];
	}

	console.log(`Loading commands...`);

	const loadCmdPromises = files.map((file) => loadCommandFile(file));

	const cmds = await Promise.all(loadCmdPromises);
	// loadCommandFile can return null, filter those out
	const validCmds = cmds.filter((cmd) => cmd);
	return validCmds;
}

export function isHelpCmd(args: string[]): boolean {
	return args.length > 0 && args[0].toLowerCase() === "help";
}

function buildNormalCmdHelpEmbed(cmd: Command): EmbedBuilder {
	const helpEmbed = new EmbedBuilder()
		.addFields(
			{ name: "Command", value: `\`${cmd.name}\``, inline: true },
			{ name: "Description", value: cmd.description },
			{ name: "Usage", value: `\`${PREFIX}${cmd.usage}\`` }
		)
		.setColor(0x0);

	const { examples } = cmd;
	if (examples != null && examples.length > 0) {
		let examplesStr = "";
		for (let i = 0; i < examples.length; i += 1) {
			examplesStr += `\`${PREFIX}${examples[i]}\``;
			if (i !== examples.length - 1) examplesStr += "\n";
		}
		helpEmbed.addFields({ name: "Examples", value: examplesStr });
	}

	return helpEmbed;
}

// TODO: Finish full parent/subcmds embed
// TODO: Get rid of duplicated code with buildNormalCmdHelpEmbed
function buildParentCmdHelpEmbed(cmd: ParentCommand): EmbedBuilder {
	const helpEmbed = new EmbedBuilder()
		.addFields(
			{ name: "Command", value: `\`${cmd.name}\``, inline: true },
			{ name: "Description", value: cmd.description }
		)
		.setColor(0x0);

	const { examples } = cmd;
	if (examples != null && examples.length > 0) {
		let examplesStr = "";
		for (let i = 0; i < examples.length; i += 1) {
			examplesStr += `\`${PREFIX}${examples[i]}\``;
			if (i !== examples.length - 1) examplesStr += "\n";
		}
		helpEmbed.addFields({ name: "Examples", value: examplesStr });
	}

	return helpEmbed;
}

// Handles the help call for a specific command
// called when for ex: '>rally help' is sent
export async function handleHelpCmd(msg: Message, cmd: Command) {
	console.log(`Help for the ${cmd.name} command detected by: ${msg.author.username}`);

	const helpEmbed = cmd instanceof ParentCommand ? buildParentCmdHelpEmbed(cmd) : buildNormalCmdHelpEmbed(cmd);

	await sendEmbeds(msg.channel, [helpEmbed]);
	console.log("Help was successful.");
	printSpace();
}

export function createCmdErrorStr(cmdName: string, error: Error, ci: CommandInteraction): string {
	let errStr = `Error when executing command ${cmdName}\n`;
	errStr += `**msg**: ${JSON.stringify(ci)}\n\n`;
	errStr += `**error**: ${error.stack}\n\n`;
	return errStr;
}
