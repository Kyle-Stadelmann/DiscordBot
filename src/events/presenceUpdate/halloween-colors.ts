import { ArgsOf, Discord, On } from "discordx";
import { BD5_ID } from "../../constants.js";

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class HalloweenColors {
	@On({ event: "presenceUpdate" })
	private async updateHalloweenColors([oldPresence, newPresence]: ArgsOf<"presenceUpdate">) {
		if (!oldPresence || !newPresence) return;
		if (oldPresence.guild.id !== BD5_ID) return;
		// Only activate in October
		if (new Date().getMonth() !== 9) return;
		// Only activate if user went from an offline->online or an online->offline state
		// meaning, either old or new presence needs to be offline, but the other can't be as well
		if ((oldPresence.status === "offline") === (newPresence.status === "offline")) return;
		console.log("hi");
	}
}
