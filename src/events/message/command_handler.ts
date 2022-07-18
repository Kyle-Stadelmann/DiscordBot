import { ArgsOf, Discord, On } from "discordx";
import { PREFIX } from "../../constants.js";
import { processCmd } from "../../util/index.js";

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
			await processCmd(msg);
		}
	}
}
