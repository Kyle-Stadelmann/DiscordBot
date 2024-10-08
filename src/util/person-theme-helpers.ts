import { VoiceState } from "discord.js";
import { bdbot } from "../app.js";
import { random, sleep } from "./index.js";
import { isNullOrUndefined } from "./general.js";
import { queueSong } from "./music-helpers.js";

export async function tryPlayPersonTheme(
	personId: string,
	chance: number,
	themeUrl: string,
	oldState: VoiceState,
	newState: VoiceState,
	startTime?: number // In ms
) {
	const { player } = bdbot;
	const stateMemberId = oldState.member.id;

	if (stateMemberId === personId && oldState.channel === null && newState.channel !== null && random(chance)) {
		// Don't run if a queue currently exists
		let queue = player.queues.resolve(newState.guild.id);
		if (!isNullOrUndefined(queue) && !queue.isEmpty()) {
			return;
		}

		try {
			await queueSong(newState.channel, themeUrl, newState.channel, newState.member.user);
			await queue.node.seek(startTime);
		} catch (e) {
			console.error(`Failed to play theme for memberId: ${stateMemberId}`);
		}

		// disconnect after 15 seconds
		await sleep(15000);

		queue = player.queues.resolve(newState.guild.id);
		if (queue) queue.delete();
	}
}
