import { ArgsOf, Discord, On } from "discordx";
import { bdbot } from "../../app.js";
import { TYPE_SPEED_RESET_TIME } from "../../constants.js";

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class TypeSpeedWatcher {
	@On({ event: "typingStart" })
	private async watchTypeState([typingState]: ArgsOf<"typingStart">) {
		const userId = typingState.user.id;
		// Only watch people in the typingTimestamps collection
		if (!bdbot.typingTimestamps.has(userId)) return;

		const timestamp = bdbot.typingTimestamps.get(userId);
		if (timestamp === null || timestamp + TYPE_SPEED_RESET_TIME < new Date().getTime()) {
			console.log(`Watching: ${userId}`);
			bdbot.typingTimestamps.set(userId, typingState.startedTimestamp);
		}
	}
}
