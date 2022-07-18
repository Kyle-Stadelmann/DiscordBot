import { Message } from "discord.js";
import { bdbot } from "../app.js";
import { PREFIX } from "../constants.js";

// From GAwesomeBot's parser
function parseArgs(content: string, delim: string = " "): string[] {
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

export async function processCmd(msg: Message) {
	const cmdArgs = parseArgs(msg.content.toLowerCase());
	const cmdStr = cmdArgs[0].slice(PREFIX.length);

	// Args String array, get rid of command string
	const args = cmdArgs.slice(1);

	console.log(`${cmdStr} command detected by: ${msg.author.username}`);

	const result = await bdbot.commandContainer.tryRunCommand(cmdStr, msg, args);
	if (result) {
		console.log(`${cmdStr} was successful`);
	} else {
		console.error(`${cmdStr} was NOT successful`);
	}
}