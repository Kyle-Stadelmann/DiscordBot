import { EmojiIdentifierResolvable, Message } from "discord.js";

export async function tryReactMessage(msg: Message, emoji: EmojiIdentifierResolvable) {
	try {
		await msg.react(emoji);
		return true;
	} catch (e) {
		if (e.code === 90001) {
			// DiscordAPIError: Reaction blocked
			return false;
		}
		throw e;
	}
}
