import { ArgsOf, Discord, On } from "discordx";
import { client } from "../../app.js";
import { BD5_ID, KHANG_ID, KHANG_NEKO_EMOJI_ID } from "../../constants.js";
import { random, tryReactMessage } from "../../util/index.js";

const KHANG_NEKO_CHANCE = 0.5;

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class KhangNeko {
	@On({ event: "messageCreate" })
	private async tryKhangNeko([msg]: ArgsOf<"messageCreate">) {
		if (msg.author.id !== KHANG_ID || msg.guildId !== BD5_ID) return;
		const KHANG_NEKO_EMOJI = client.emojis.cache.get(KHANG_NEKO_EMOJI_ID);

		if (random(KHANG_NEKO_CHANCE) && KHANG_NEKO_EMOJI) {
			await tryReactMessage(msg, KHANG_NEKO_EMOJI);
		}
	}
}
