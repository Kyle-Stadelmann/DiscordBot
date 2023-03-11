import { VoiceState } from "discord.js";
import { bdbot } from "../app.js";
import { random, sleep } from "./index.js";

export async function tryPlayPersonTheme(personId: string, chance: number, themeUrl: string, oldState: VoiceState, newState: VoiceState) {
    const stateMemberId = oldState.member.id;

    if (
        stateMemberId === personId &&
        oldState.channel === null &&
        newState.channel !== null &&
        random(chance)
    ) {
        // Don't run if a queue currently exists
        // not 100% sure this check does what i want it to
        if (bdbot.player.getQueue(newState.guild)) {
            console.log("Bot is currently playing music");
            return;
        }

        console.log(`Playing theme for memberId: ${stateMemberId}`);
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
            console.log(`Failed to play theme for memberId: ${stateMemberId}`);
            return;
        }
        const track = await bdbot.player
            .search(themeUrl, {
                requestedBy: newState.guild.members.cache.get(personId),
                searchEngine: 0,
            })
            .then((x) => x.tracks[0]);
        await queue.play(track);

        // disconnect after 15 seconds
        await sleep(15000);
        queue.destroy(true);
        console.log(`Exiting theme for memberId: ${stateMemberId}`);
    }
}