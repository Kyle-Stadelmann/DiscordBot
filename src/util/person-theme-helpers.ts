import { VoiceState } from "discord.js";
import { QueryType } from "discord-player";
import { bdbot } from "../app.js";
import { random, sleep } from "./index.js";
import { isNullOrUndefined } from "./general.js";

export async function tryPlayPersonTheme(
	personId: string,
	chance: number,
	themeFilePath: string,
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
			await player.play(newState.channel, themeFilePath, {
				requestedBy: newState.member.user,
				searchEngine: QueryType.FILE,
				nodeOptions: {
					disableSeeker: false,
				},
				audioPlayerOptions: { seek: startTime },
			});
		} catch (e) {
			console.error(`Failed to play theme for memberId: ${stateMemberId}`);
			console.error(e);
		}

		// Disconnect after a few seconds
		await sleep(5000);
		queue = player.queues.resolve(newState.guild.id);
		if (queue && queue.size === 0) queue.delete();
	}
}
