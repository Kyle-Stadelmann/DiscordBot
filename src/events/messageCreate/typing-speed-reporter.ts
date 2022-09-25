import { ArgsOf, Discord, On } from "discordx";
import { bdbot } from "../../app.js";
import { printSpace, random, sendMessage } from "../../util/index.js";
import { countWords, danielWPMChanceFunction } from "./daniel-wpm.js";

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class TypingSpeedReporter {
	@On({event: "messageCreate"})
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
			await sendMessage(
				channel,
				`That message took approximately ${typingTimeInt} seconds, with a WPM of ${wpmInt}`
			);
			printSpace();
		}

		// Regardless if we sent the type speed or not, reset the timestamp for this user
		bdbot.typingTimestamps.set(userId, null);
	}
}
