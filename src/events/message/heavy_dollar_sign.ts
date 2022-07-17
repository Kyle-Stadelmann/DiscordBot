import { Message } from "discord.js";
import { Discord, On } from "discordx";
import { HEAVY_DOLLAR_SIGN } from "../../constants";
import { random } from "../../util";

const HEAVY_DOLLAR_SIGN_CHANCE = 0.5;

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class RandomHeavyDollarSigns {
	@On("message")
	private async tryHeavyDollarSign(msg: Message) {
		if (random(HEAVY_DOLLAR_SIGN_CHANCE)) {
			await msg.react(HEAVY_DOLLAR_SIGN);
		}
	}
}
