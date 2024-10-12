import { EmojiIdentifierResolvable, Message, MessageCreateOptions, MessagePayload, User } from "discord.js";

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

export async function tryDM(user: User, options: string | MessagePayload | MessageCreateOptions) {
	try {
		await user.send(options);
		return true;
	} catch (e) {
		console.error(e);
		throw e;
	}
}
