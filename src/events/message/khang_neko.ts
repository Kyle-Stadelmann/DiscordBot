import { ArgsOf, Discord, On } from "discordx";
import { client } from "../../app.js";
import { KHANG_ID, KHANG_NEKO_EMOJI_ID } from "../../constants.js";
import { random } from "../../util/index.js";

const KHANG_NEKO_CHANCE = 5;

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class KhangNeko {
	@On("messageCreate")
	private async tryKhangNeko([msg]: ArgsOf<"messageCreate">) {
		if (msg.author.id !== KHANG_ID) return;
		const KHANG_NEKO_EMOJI = client.emojis.cache.find((val) => val.name === KHANG_NEKO_EMOJI_ID);

		if (random(KHANG_NEKO_CHANCE)) {
			await msg.react(KHANG_NEKO_EMOJI);
		}
	}
}
