// Critical to functionality of command
/* eslint-disable no-await-in-loop */
import { ChannelType, CommandInteraction, SlashCommandBuilder } from "discord.js";
import { CommandConfig, Command, CommandCategory } from "../../types/command.js";
import { sendErrorMessage, sendMessage } from "../../util/message-channel.js";
import { sleep } from "../../util/sleep.js";

const SPAM_AMMOUNT = 4;
const SLEEP_TIME_MS = 10 * 1000;
const MAX_SPAM_AMOUNT = 20;

const cmdConfig: CommandConfig = {
	name: "spam",
	description: "Repeatedly ping a victim with a message until they respond.",
	category: CommandCategory.Utility,
	usage: `spam @user [Message BatchAmount]`,
	examples: ["spam @Xited1730", "spam @Xited1730 hello 5", 'spam @Xited1730 "wake up" 3'],
	cooldownTime: 10 * 60 * 1000
};

class SpamCommand extends Command {
	public async run(interaction: CommandInteraction): Promise<boolean> {
		const victim = msg.mentions.members?.first();
		const startTs = msg.createdTimestamp;
		const { channel } = msg;

		if (!victim) {
			await sendErrorMessage(channel, "You must specify a victim.");
			return false;
		}

		const spamStr: string = args[1];
		let moveTimes = args.length > 1 && +args[2] ? +args[2] : 1;
		moveTimes = Math.min(moveTimes, MAX_SPAM_AMOUNT);

		await sendMessage(channel, `Spamming ${moveTimes} time${moveTimes === 1 ? "" : "s"}...`);

		for (let i = 0; i < moveTimes; i += 1) {
			for (let s = 0; s < SPAM_AMMOUNT; s += 1) {
				await sendMessage(channel, `${victim.toString()} ${spamStr}`);
			}

			await sleep(SLEEP_TIME_MS);

			// This command is not allowed in DM so this will never be true.
			// But this is necessary for the next line to type check
			if (channel.type === ChannelType.DM) return false;
			if (channel.messages.cache.some((m) => m.member === victim && m.createdTimestamp > startTs)) {
				await sendMessage(channel, `Stopping spam since victim has responded.`);
				return true;
			}
		}

		return true;
	}
}

export default new SpamCommand(cmdConfig);
