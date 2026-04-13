import { ArgsOf, Discord, Guard, On } from "discordx";
import { client } from "../../app.js";
import { KHANG_ID, KHANG_NEKO_EMOJI_ID } from "../../constants.js";
import { random, tryReactMessage } from "../../util/index.js";
import { BD5Only } from "../../util/guards.js";

const KHANG_NEKO_CHANCE = 0.5;

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class KhangNeko {
	@Guard(BD5Only)
	@On({ event: "messageCreate" })
	private async tryKhangNeko([msg]: ArgsOf<"messageCreate">) {
		if (msg.author.id !== KHANG_ID) return;
		const KHANG_NEKO_EMOJI = client.emojis.cache.get(KHANG_NEKO_EMOJI_ID);

		if (random(KHANG_NEKO_CHANCE) && KHANG_NEKO_EMOJI) 
			{await tryReactMessage(msg, KHANG_NEKO_EMOJI);}
		
	}
}
