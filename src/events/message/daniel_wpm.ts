import { Message } from "discord.js";
import { Discord, On } from "discordx";
import { DANIEL_ID, PREFIX, DANIEL_WPM } from "../../constants";
import { sendMessage } from "../../util";

export function danielWPMChanceFunction(numWords: number): number {
	const MIN_WORDS = 8;
	const MAX_CHANCE = 15;

	// If not enough words, chance is 0%
	if (numWords < MIN_WORDS) return 0;

	// Chance equation (exponential)
	let chance = (numWords ** 1.7) * 0.1;
	if (chance > MAX_CHANCE) chance = MAX_CHANCE;

	return chance;
}

// Calculates words per minutes (in seconds)
function wordsPerMinute(wpm, numWords) {
	return (numWords / wpm) * 60;
}

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class DanielWPM {
	@On("message")
	private async tryDanielWPM(msg: Message) {
		// Only continue if Daniel sent the message
		if (msg.author.id !== DANIEL_ID) return;
		// ignore commands for this event
		if (msg.content.startsWith(PREFIX)) return;

		const numWords = msg.content.split(" ").length;
		if (danielWPMChanceFunction(numWords)) {
			await sendMessage(msg.channel, `It took Daniel approximately ${ 
				wordsPerMinute(DANIEL_WPM, numWords) 
				} seconds to type that assuming he types at ${ 
				DANIEL_WPM 
				} words per minute.`);
		}
	}
}