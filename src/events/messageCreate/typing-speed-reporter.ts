import { ArgsOf, Discord, On } from "discordx";
import { bdbot } from "../../app.js";
import { printSpace, random } from "../../util/index.js";

function danielWPMChanceFunction(numWords: number): number {
	const MIN_WORDS = 8;
	const MAX_CHANCE = 5;

	// If not enough words, chance is 0%
	if (numWords < MIN_WORDS) return 0;

	// Chance equation (exponential)
	return Math.min(numWords ** 1.7 * 0.01, MAX_CHANCE);
}

function countWords(str: string) {
	return str ? str.trim().split(/\s+/).length : 0;
}

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class TypingSpeedReporter {
	@On({ event: "messageCreate" })
	private async tryReportTypingSpeed([msg]: ArgsOf<"messageCreate">) {
		const userId = msg.author.id;
		const { channel } = msg;

		if (!bdbot.typingTimestamps.has(userId) || !bdbot.typingTimestamps.get(userId)) return;

		const wordCount = countWords(msg.content);
		if (wordCount === 0) return;

		if (random(danielWPMChanceFunction(wordCount))) {
			// Time spent typing message in seconds
			const typingTime = (msg.createdTimestamp - bdbot.typingTimestamps.get(userId)) / 1000;
			const wpm = (wordCount / typingTime) * 60;
			const typingTimeInt = typingTime.toFixed(0);
			const wpmInt = wpm.toFixed(0);

			console.log(`Reporting a typing time of: ${typingTimeInt} with WPM of ${wpmInt} for user: ${userId}`);
			await channel.send(`That message took approximately ${typingTimeInt} seconds, with a WPM of ${wpmInt}`);
			printSpace();
		}

		// Regardless if we sent the type speed or not, reset the timestamp for this user
		bdbot.typingTimestamps.set(userId, null);
	}
}
