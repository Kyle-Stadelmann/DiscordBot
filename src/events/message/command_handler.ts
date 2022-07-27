import { Message } from "discord.js";
import { ArgsOf, Discord, On } from "discordx";
import { bdbot } from "../../app.js";
import { PREFIX } from "../../constants.js";
import { parseArgs } from "../../util/index.js";

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export abstract class CommandHandler {
	@On("messageCreate")
	private async handleMessage([msg]: ArgsOf<"messageCreate">) {
		// If message comes from a bot, don't perform any of the below events
		// (to stop bd4 bot from triggering other bots events)
		if (msg.author.bot) {
			return;
		}

		// Command processing, check if message is a command
		if (msg.content.indexOf(PREFIX) === 0) {
			await this.processCmd(msg);
		}
	}

	private async processCmd(msg: Message) {
		const cmdArgs = parseArgs(msg.content);
		const cmdStr = cmdArgs[0].slice(PREFIX.length).toLowerCase();

		// Args String array, get rid of command string
		const args = cmdArgs.slice(1);

		console.log(`${cmdStr} command detected by: ${msg.author.username}`);

		const result = await bdbot.tryRunCommand(cmdStr, msg, args);
		if (result) {
			console.log(`${cmdStr} was successful`);
		} else {
			console.error(`${cmdStr} was NOT successful`);
		}
	}
}
