import { ArgsOf, Discord, On } from "discordx";
import { ASIAN_KYLE_ID } from "../../constants.js";
import { random } from "../../util/index.js";

const MUTE_ASIAN_KYLE_CHANCE = 0;

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class AsianKyleRandomMute {
	@On({ event: "voiceStateUpdate" })
	private async tryMute([oldState, newState]: ArgsOf<"voiceStateUpdate">) {
		const memberId = oldState.member.id;
		if (memberId === ASIAN_KYLE_ID && random(MUTE_ASIAN_KYLE_CHANCE)) {
			console.log(`Server muting member: ${memberId}`);
			await newState.member.edit({ mute: true });
		}
	}
}
