import { DiscordAPIError, EmojiIdentifierResolvable, Message, RESTJSONErrorCodes } from "discord.js";

export async function tryReactMessage(msg: Message, emoji: EmojiIdentifierResolvable) {
	try {
		await msg.react(emoji);
		return true;
	} catch (e: unknown) {
		if (e instanceof DiscordAPIError && e.code === RESTJSONErrorCodes.ReactionWasBlocked) {
			return false;
		}
		throw e;
	}
}
