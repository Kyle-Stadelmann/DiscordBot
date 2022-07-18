import { ArgsOf, Discord, On } from "discordx";
import { random, sendMessage } from "../../util/index.js";

const ZACC_CHANCE = 5;

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class ZachZacc {
	@On("messageCreate")
	private async handleZachZacc([msg]: ArgsOf<"messageCreate">) {
		const content = msg.content.toLowerCase();
		// Only continue if "zach" is found in a message
		if (!content.includes("zach")) return;

		if (random(ZACC_CHANCE)) {
			let output = "";
			// loop through until message has no more "zach"'s
			while (content.includes("zach")) {
				const zachIndex = content.indexOf("zach");
				const firstHalf = content.substring(0, zachIndex);
				const lastHalf = content.substring(zachIndex + 4);

				output += `${firstHalf}zacc${lastHalf}`;
			}

			await sendMessage(msg.channel, `${output}*`);
		}
	}
}
