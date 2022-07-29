import { ArgsOf, Discord, On } from "discordx";
import { ASIAN_KYLE_ID, BD4_BOT_ID, L_THEME_URL } from "../../constants.js";
import { random, sleep } from "../../util/index.js";
import { bdbot } from "../../app.js";

const L_THEME_CHANCE = 15;

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class AsianKyleLTheme {
	@On("voiceStateUpdate")
	private async tryLTheme([oldState, newState]: ArgsOf<"voiceStateUpdate">) {
		if (oldState.id === BD4_BOT_ID) return false;

		const memberId = oldState.member.id;

        if (memberId === ASIAN_KYLE_ID && oldState.channel === null &&
        newState.channel !== null && random(L_THEME_CHANCE)) {
            // Don't run if a queue currently exists
            // not 100% sure this check does what i want it to
            if (bdbot.player.getQueue(newState.guild)) {
                console.log("Bot is currently playing music");
                return false;
            }

			console.log(`Playing L's Theme: ${memberId}`);
			// https://discord-player.js.org/docs/main/master/general/welcome
			const queue = bdbot.player.createQueue(newState.channel.guild, {
				metadata: { channel: newState.channel },
				ytdlOptions: {
					filter: "audioonly",
					// eslint-disable-next-line no-bitwise
					highWaterMark: 1 << 30,
					dlChunkSize: 0,
				},
			});
			try {
				if (!queue.connection) await queue.connect(newState.channel);
			} catch {
				queue.destroy();
				console.log("didnt work ?");
				return false;
			}
			const track = await bdbot.player
				.search(L_THEME_URL, {
					requestedBy: newState.guild.members.cache.get(ASIAN_KYLE_ID),
					searchEngine: 0,
				})
				.then((x) => x.tracks[0]);
			await queue.play(track);

			// disconnect after 15 seconds
			await sleep(15000);
			queue.destroy(true);
			console.log(`Exiting L's Theme: ${memberId}`);
		}

		return true;
	}
}
