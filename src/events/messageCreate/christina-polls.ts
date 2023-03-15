/* eslint-disable no-await-in-loop */
import { ArgsOf, Discord, On } from "discordx";
import {
	CHRISTINA_POLLS_CHANNEL_ID,
	EIGHT_EMOJI,
	FIVE_EMOJI,
	FOUR_EMOJI,
	NINE_EMOJI,
	ONE_EMOJI,
	SEVEN_EMOJI,
	SIX_EMOJI,
	THREE_EMOJI,
	TWO_EMOJI,
} from "../../constants.js";

const numToUnicodeEmojiMap: Map<number, string> = new Map([
	[1, ONE_EMOJI],
	[2, TWO_EMOJI],
	[3, THREE_EMOJI],
	[4, FOUR_EMOJI],
	[5, FIVE_EMOJI],
	[6, SIX_EMOJI],
	[7, SEVEN_EMOJI],
	[8, EIGHT_EMOJI],
	[9, NINE_EMOJI],
]);

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class ChristinaPolls {
	@On({ event: "messageCreate" })
	private async tryReactPoll([msg]: ArgsOf<"messageCreate">) {
		if (msg.channelId === CHRISTINA_POLLS_CHANNEL_ID) {
			for (let i = 1; i <= 9; i += 1) {
				if (msg.content.includes(`${i}:`)) {
					const numEmoji = numToUnicodeEmojiMap.get(i);
					await msg.react(numEmoji);
				}
			}
		}
	}
}
