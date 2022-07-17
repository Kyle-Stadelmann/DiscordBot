import { Typing } from "discord.js";
import { Discord, On } from "discordx";
import { bdbot } from "../../../app";
import { TYPE_SPEED_RESET_TIME } from "../../../constants";

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class TypeSpeedWatcher {
	@On("typingStart")
	private async watchTypeState(typingState: Typing) {
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
