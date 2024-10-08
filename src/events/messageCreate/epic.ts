import { ArgsOf, Discord, On } from "discordx";
import { SUNGLASSES } from "../../constants.js";
import { random, tryReactMessage } from "../../util/index.js";

const EPIC_SUNGLASSES_CHANCE = 100;
const SUNGLASSES_EPIC_CHANCE = 100;

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class Epic {
	@On({ event: "messageCreate" })
	private async handleEpic([msg]: ArgsOf<"messageCreate">) {
		// Reads "epic" from chat and reacts with sunglasses emoji
		if (msg.content.toLowerCase().includes("epic") && random(EPIC_SUNGLASSES_CHANCE)) {
			await tryReactMessage(msg, SUNGLASSES);
		}

		// Reads sunglasses emoji from chat and reacts with E, P, I, C
		if (msg.content.includes(SUNGLASSES) && random(SUNGLASSES_EPIC_CHANCE)) {
			await tryReactMessage(msg, "🇪");
			await tryReactMessage(msg, "🇵");
			await tryReactMessage(msg, "🇮");
			await tryReactMessage(msg, "🇨");
		}
	}
}
