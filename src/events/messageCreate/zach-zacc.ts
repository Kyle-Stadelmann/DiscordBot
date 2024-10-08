import { ArgsOf, Discord, On } from "discordx";
import { random } from "../../util/index.js";

const ZACC_CHANCE = 7.5;
const ZACH_REGEX = /[Zz][Aa][Cc][Hh]/gm;

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class ZachZacc {
	@On({ event: "messageCreate" })
	private async handleZachZacc([msg]: ArgsOf<"messageCreate">) {
		const { content } = msg;
		if (msg.author.bot || !content.match(ZACH_REGEX)) return;

		if (random(ZACC_CHANCE)) {
			const output = content.replaceAll(ZACH_REGEX, (s) => s.slice(0, 3) + s.charAt(2));
			await msg.channel.send(`${output}*`);
		}
	}
}
