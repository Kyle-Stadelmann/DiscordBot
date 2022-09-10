// Critical to functionality of command
/* eslint-disable no-await-in-loop */
import { Message } from "discord.js";
import { CommandConfig, Command } from "../../types/command.js";
import { sendErrorMessage, sendMessage } from "../../util/message_channel.js";
import { sleep } from "../../util/sleep.js";

const cmdConfig: CommandConfig = {
	name: "spam",
	description: "Repeatedly ping a victim with a message until they respond.",
	usage: `spam @user [Message BatchAmount]`,
	examples: ["spam @Xited1730", "spam @Xited1730 hello 5", 'spam @Xited1730 "wake up" 3'],
};

const SPAM_AMMOUNT = 4;
const SLEEP_TIME_MS = 10 * 1000;

class SpamCommand extends Command {
	public async run(msg: Message, args: string[]): Promise<boolean> {
		const victim = msg.mentions.members?.first();
		const startTs = msg.createdTimestamp;
		const { channel } = msg;

		if (!victim) {
			await sendErrorMessage(channel, "You must specify a victim.");
			return false;
		}

		const spamStr: string = args[1];
		const moveTimes = args.length > 1 && +args[2] ? +args[2] : 1;

		await sendMessage(channel, `Spamming ${moveTimes} times...`);

		for (let i = 0; i < moveTimes; i += 1) {
			for (let s = 0; s < SPAM_AMMOUNT; s += 1) {
				await sendMessage(channel, `${victim.toString()} ${spamStr}`);
			}

			await sleep(SLEEP_TIME_MS);

			if (channel.messages.cache.some((m) => m.member === victim && m.createdTimestamp > startTs)) {
				await sendMessage(channel, `Stopping spam since victim has responded.`);
				return true;
			}
		}

		return true;
	}
}

export default new SpamCommand(cmdConfig);
