import { VoiceState } from "discord.js";
import { Discord, On } from "discordx";
import { ASIAN_KYLE_ID } from "../../constants";
import { random } from "../../util";

const MUTE_ASIAN_KYLE_CHANCE = 0.1;

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class AsianKyleRandomMute {
	@On("voiceStateUpdate")
	private async tryMute(oldState: VoiceState, newState: VoiceState) {
		const memberId = oldState.member.id;
		if (memberId === ASIAN_KYLE_ID && random(MUTE_ASIAN_KYLE_CHANCE)) {
			console.log(`Server muting member: ${memberId}`);
			await newState.member.edit({ mute: true });
		}
	}
}
