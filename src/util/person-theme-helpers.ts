import { VoiceState } from "discord.js";
import { bdbot } from "../app.js";
import { random, sleep } from "./index.js";
import { isNullOrUndefined } from "./general.js";

export async function tryPlayPersonTheme(
	personId: string,
	chance: number,
	themeUrl: string,
	oldState: VoiceState,
	newState: VoiceState
) {
	const {player} = bdbot;
	const stateMemberId = oldState.member.id;

	if (stateMemberId === personId && oldState.channel === null && newState.channel !== null && random(chance)) {
		// Don't run if a queue currently exists
		const queue = player.queues.resolve(newState.guild.id);
		if (!isNullOrUndefined(queue) && !queue.isEmpty()) {
			return;
		}

		try {
			await player.play(newState.channel, themeUrl, {
				requestedBy: newState.guild.members.cache.get(personId),
				nodeOptions: {metadata: {channel: newState.channel}}
			});
			console.log(`Playing theme for memberId: ${stateMemberId}`);
		} catch (e) {
			console.error(`Failed to play theme for memberId: ${stateMemberId}`);
		}

		// disconnect after 15 seconds
		await sleep(15000);
		
		player.queues.resolve(newState.guild.id).delete();
		console.log(`Exiting theme for memberId: ${stateMemberId}`);
	}
}
