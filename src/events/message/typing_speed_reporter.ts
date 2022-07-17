import { Message } from "discord.js";
import { Discord, On } from "discordx";
import { bdbot } from "../../app";
import { random, sendMessage, printSpace } from "../../util";
import { danielWPMChanceFunction } from "./daniel_wpm";

function countWords(str) {
	return str ? str.trim().split(/\s+/).length : 0;
}

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class TypingSpeedReporter {
	@On("message")
	private async tryReportTypingSpeed(msg: Message) {
		const userId = msg.author.id;
		const {channel} = msg;

		if (!bdbot.typingTimestamps.has(userId) || !bdbot.typingTimestamps.get(userId)) return;

		const wordCount = countWords(msg.content);
		if (wordCount === 0) return;
	
		if (random(danielWPMChanceFunction(wordCount))) {
			// Time spent typing message in seconds
			const typingTime = (msg.createdTimestamp - bdbot.typingTimestamps.get(userId)) / 1000;
			const wpm = (wordCount / typingTime) * 60;
	
			console.log(`Reporting a typing time of: ${typingTime} with WPM of ${wpm} for user: ${userId}`);
			await sendMessage(channel, `That message took approximately ${typingTime} seconds, with a WPM of ${wpm}`);
			printSpace();
		}
	
		// Regardless if we sent the type speed or not, reset the timestamp for this user
		bdbot.typingTimestamps.set(userId, null);
	}
}