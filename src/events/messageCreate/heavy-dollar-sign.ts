import { ArgsOf, Discord, On } from "discordx";
import { HEAVY_DOLLAR_SIGN } from "../../constants.js";
import { random } from "../../util/index.js";

const HEAVY_DOLLAR_SIGN_CHANCE = 0.5;

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class RandomHeavyDollarSigns {
	@On({ event: "messageCreate" })
	private async tryHeavyDollarSign([msg]: ArgsOf<"messageCreate">) {
		if (random(HEAVY_DOLLAR_SIGN_CHANCE)) {
			await msg.react(HEAVY_DOLLAR_SIGN);
		}
	}
}
