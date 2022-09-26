import { Message, EmbedBuilder } from "discord.js";
import path from "path";
import { PREFIX } from "../constants.js";
import { Command } from "../types/command.js";
import { ParentCommand } from "../types/parent-command.js";
import { isDevMode } from "./settings-helpers.js";
import { sendEmbeds } from "./message-channel.js";
import { printSpace } from "./print-space.js";

// From GAwesomeBot's parser
export function parseArgs(content: string, delim: string = " "): string[] {
	if (delim === "") return [content];

	const args = [];
	let current = "";
	let open = false;

	for (let i = 0; i < content.length; i += 1) {
		if (!open && content.slice(i, i + delim.length) === delim) {
			if (current !== "") args.push(current);
			current = "";
			i += delim.length - 1;
			// eslint-disable-next-line no-continue
			continue;
		}
		if (content[i] === '"') {
			open = !open;
			if (current !== "") args.push(current);
			current = "";
			// eslint-disable-next-line no-continue
			continue;
		}
		current += content[i];
	}
	if (current !== "") args.push(current);

	return args.length === 1 && args[0] === "" ? [] : args.filter((a) => a !== delim && a !== " ");
}

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
			{name: "Command", value: `\`${cmd.name}\``, inline: true},
			{name: "Description", value: cmd.description},
			{name: "Usage", value: `\`${PREFIX}${cmd.usage}\``}
		)
		.setColor(0x0);

	const { examples } = cmd;
	if (examples != null && examples.length > 0) {
		let examplesStr = "";
		for (let i = 0; i < examples.length; i += 1) {
			examplesStr += `\`${PREFIX}${examples[i]}\``;
			if (i !== examples.length - 1) examplesStr += "\n";
		}
		helpEmbed.addFields({name: "Examples", value: examplesStr});
	}

	return helpEmbed;
}

// TODO: Finish full parent/subcmds embed
// TODO: Get rid of duplicated code with buildNormalCmdHelpEmbed
function buildParentCmdHelpEmbed(cmd: ParentCommand): EmbedBuilder {
	const helpEmbed = new EmbedBuilder()
		.addFields(
			{name: "Command", value: `\`${cmd.name}\``, inline: true},
			{name: "Description", value: cmd.description}
		)
		.setColor(0x0);

	const { examples } = cmd;
	if (examples != null && examples.length > 0) {
		let examplesStr = "";
		for (let i = 0; i < examples.length; i += 1) {
			examplesStr += `\`${PREFIX}${examples[i]}\``;
			if (i !== examples.length - 1) examplesStr += "\n";
		}
		helpEmbed.addFields({name: "Examples", value: examplesStr});
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

export function createCmdErrorStr(cmdStr: string, error: Error, msg: Message, args: string[]): string {
	let errStr = `Error when executing command ${cmdStr}\n`;
	errStr += `**msg**: ${JSON.stringify(msg)}\n\n`;
	errStr += `**args**: ${JSON.stringify(args)}\n\n`;
	errStr += `**error**: ${error.stack}\n\n`;
	return errStr;
}
