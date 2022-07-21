import { ArgsOf, Discord, On } from "discordx";
import { ASIAN_KYLE_ID, BD4_BOT_ID } from "../../constants.js";
import { random } from "../../util/index.js";
import { joinVoiceChannel, getVoiceConnection } from "@discordjs/voice";

const L_THEME_CHANCE = 15;

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class AsianKyleLTheme {
	@On("voiceStateUpdate")
	private async tryLTheme([oldState, newState]: ArgsOf<"voiceStateUpdate">) {
		if (oldState.id === BD4_BOT_ID) return false;

        const memberId = oldState.member.id;

        if (memberId === ASIAN_KYLE_ID &&
            oldState.channel === null &&
            newState.channel !== null &&
            random(L_THEME_CHANCE)) {

			joinVoiceChannel({
                channelId: newState.channelId,
                guildId: newState.channel.guildId,
                selfDeaf: true,
    
                adapterCreator: newState.guild.voiceAdapterCreator,
            });

            console.log(`Playing L's Theme (no music yet): ${memberId}`);
            // TODO: music playing goes here

            // disconnect after 10 seconds
            await new Promise(f => setTimeout(f, 10000));
            getVoiceConnection(newState.channel.guildId).destroy();
            console.log(`Exiting L's Theme (no music yet): ${memberId}`);
		}

        return true;
	}
}
