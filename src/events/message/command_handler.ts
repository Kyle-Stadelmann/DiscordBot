import { Message } from "discord.js";
import { Discord, On } from "discordx";
import { bdbot } from "../../app";
import { PREFIX } from "../../constants";

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

async function processCmd(msg: Message) {
	const cmdArgs = parseArgs(msg.content.toLowerCase());
	const cmdStr = cmdArgs[0].slice(PREFIX.length);

	// Args String array, get rid of command string
	const args = cmdArgs.slice(1);

	console.log(`${cmdStr} command detected by: ${msg.author.username}`);

	const result = await bdbot.commandContainer.tryRunCommand(cmdStr, msg, args);
	if (result) {
		console.error(`${cmdStr} was NOT successful`);
	} else {
		console.log(`${cmdStr} was successful`);
	}
}

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class CommandHandler {
	@On("message")
	private async handleCommand(msg: Message) {
		// If message comes from a bot, don't perform any of the below events
		// (to stop bd4 bot from triggering other bots events)
		if (msg.author.bot) {
			return;
		}

		// Command processing, check if message is a command
		if (msg.content.indexOf(PREFIX) === 0) {
			await processCmd(msg);
		}
	}
}
