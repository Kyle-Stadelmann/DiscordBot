// Critical to functionality of command
/* eslint-disable no-await-in-loop */
import { ApplicationCommandOptionType, CommandInteraction, User } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { Category } from "@discordx/utilities";
import { CommandCategory } from "../../types/command.js";
import { sleep } from "../../util/sleep.js";
import { CooldownTime } from "../../types/cooldown-time.js";

const SPAM_AMMOUNT = 4;
const SLEEP_TIME_MS = 10 * 1000;
const MAX_SPAM_AMOUNT = 20;

@Discord()
@Category(CommandCategory.Utility)
@CooldownTime(10 * 60 * 1000)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class SpamCommand {
	public cooldownTime = 10 * 60 * 1000;
	public category = CommandCategory.Utility;

	@Slash({name: "spam", description: "Repeatedly ping a victim with a message until they respond.", dmPermission: false})
	async run(
		@SlashOption({
			name: "victim",
			description: "The user to spam",
			required: true,
			type: ApplicationCommandOptionType.User
		})
		victim: User,
		@SlashOption({
			name: "message",
			description: "The message to spam",
			required: false,
			type: ApplicationCommandOptionType.String
		})
		spamMessage: string,
		@SlashOption({
			name: "count",
			description: "The number of spam batches to send (max 20)",
			required: false,
			type: ApplicationCommandOptionType.Number
		})
		count: number,
		interaction: CommandInteraction
	): Promise<boolean> {
		const startTs = interaction.createdTimestamp;
		const { channel } = interaction;

		let batchCount = count ?? 1;
		batchCount = Math.min(batchCount, MAX_SPAM_AMOUNT);
		const spamStr = spamMessage ?? "";

		await interaction.reply(`Spamming ${batchCount} times${batchCount === 1 ? "" : "s"}...`);

		for (let i = 0; i < batchCount; i += 1) {
			for (let s = 0; s < SPAM_AMMOUNT; s += 1) {
				await channel.send(`${victim.toString()} ${spamStr}`);
			}

			await sleep(SLEEP_TIME_MS);

			// This command is not allowed in DM so this will never be true.
			// But this is necessary for the next line to type check
			if (channel.messages.cache.some((m) => m.member.user === victim && m.createdTimestamp > startTs)) {
				await channel.send(`Stopping spam since victim has responded.`);
				return true;
			}
		}

		return true;
	}
}
