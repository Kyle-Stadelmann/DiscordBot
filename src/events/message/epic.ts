import { Message } from "discord.js";
import { Discord, On } from "discordx";
import { SUNGLASSES } from "../../constants";
import { random } from "../../util";

const EPIC_SUNGLASSES_CHANCE = 100;
const SUNGLASSES_EPIC_CHANCE = 100;

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class Epic {
	@On("message")
	private async handleEpic(msg: Message) {
		// Reads "epic" from chat and reacts with sunglasses emoji
		if (msg.content.toLowerCase().includes("epic") && random(EPIC_SUNGLASSES_CHANCE)) {
			await msg.react(SUNGLASSES);
		}

		// Reads sunglasses emoji from chat and reacts with E, P, I, C
		if (msg.content.includes(SUNGLASSES) && random(SUNGLASSES_EPIC_CHANCE)) {
			await msg.react("🇪");
			await msg.react("🇵");
			await msg.react("🇮");
			await msg.react("🇨");
		}
	}
}
