import { ArgsOf, Discord, On } from "discordx";
import { DANIEL_ID, PREFIX, DANIEL_WPM } from "../../constants.js";
import { sendMessage } from "../../util/message_channel.js";

export function danielWPMChanceFunction(numWords: number): number {
	const MIN_WORDS = 8;
	const MAX_CHANCE = 15;

	// If not enough words, chance is 0%
	if (numWords < MIN_WORDS) return 0;

	// Chance equation (exponential)
	let chance = numWords ** 1.7 * 0.1;
	if (chance > MAX_CHANCE) chance = MAX_CHANCE;

	return chance;
}

export function countWords(str: string) {
	return str ? str.trim().split(/\s+/).length : 0;
}

// Calculates words per minutes (in seconds)
function wordsPerMinute(wpm, numWords) {
	return (numWords / wpm) * 60;
}

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class DanielWPM {
	@On("messageCreate")
	private async tryDanielWPM([msg]: ArgsOf<"messageCreate">) {
		// Only continue if Daniel sent the message
		if (msg.author.id !== DANIEL_ID) return;
		// ignore commands for this event
		if (msg.content.startsWith(PREFIX)) return;

		const numWords = countWords(msg.content);
		if (danielWPMChanceFunction(numWords)) {
			await sendMessage(
				msg.channel,
				`It took Daniel approximately ${wordsPerMinute(
					DANIEL_WPM,
					numWords
				)} seconds to type that assuming he types at ${DANIEL_WPM} words per minute.`
			);
		}
	}
}
