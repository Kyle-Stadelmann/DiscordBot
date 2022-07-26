import { ArgsOf, Discord, On } from "discordx";
import { ASIAN_KYLE_ID, BD4_BOT_ID, ZACH_ID } from "../../constants.js";
import { random, sleep } from "../../util/index.js";
import { joinVoiceChannel, getVoiceConnection } from "@discordjs/voice";
import { Player } from "discord-player";
import { client } from "../../app.js";

const L_THEME_CHANCE = 15;

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class AsianKyleLTheme {
	@On("voiceStateUpdate")
	private async tryLTheme([oldState, newState]: ArgsOf<"voiceStateUpdate">) {
		if (oldState.id === BD4_BOT_ID) return false;

        const memberId = oldState.member.id;

        if (memberId === ZACH_ID &&
            oldState.channel === null &&
            newState.channel !== null &&
            random(L_THEME_CHANCE)) {

			joinVoiceChannel({
                channelId: newState.channelId,
                guildId: newState.channel.guildId,
                selfDeaf: true,
    
                adapterCreator: newState.guild.voiceAdapterCreator,
            });

            console.log(`Playing L's Theme: ${memberId}`);
            // TODO: move queue creation to initial bot loading so that the music
            // can play instantly, create constant for url, etc etc

            // https://discord-player.js.org/docs/main/master/general/welcome
            const player = new Player(client);
            const queue = player.createQueue(newState.channel.guild, {
                metadata: {
                    channel: newState.channel
                }
            });
            try {
                if (!queue.connection) await queue.connect(newState.channel);
            } catch {
                queue.destroy();
                return console.log("didnt work ?");
            }
            const track = await player.search("https://www.youtube.com/watch?v=qR6dzwQahOM", {
                requestedBy: newState.guild.members.cache.get(ASIAN_KYLE_ID)
            }).then(x => x.tracks[0]);
            queue.play(track);

            // disconnect after 10 seconds
            await sleep(10000);
            getVoiceConnection(newState.channel.guildId).destroy();
            console.log(`Exiting L's Theme (no music yet): ${memberId}`);
		}

        return true;
	}
}
