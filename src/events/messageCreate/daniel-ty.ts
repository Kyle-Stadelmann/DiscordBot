import { ArgsOf, Discord, On } from "discordx";
import { DANIEL_ID } from "../../constants.js";

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class DanielTy {
	@On({ event: "messageCreate" })
	private async handleDanielTy([msg]: ArgsOf<"messageCreate">) {
		const { channel } = msg;
		const content = msg.content.toLowerCase();
		// Only continue if Daniel sent the message
		if (msg.author.id !== DANIEL_ID) return;

		if (content.includes("thank") && content.includes("bot")) {
			await channel.send("You're welcome DualKim! :)");
		}

		if (content.includes("fuck") && content.includes("bot")) {
			await channel.send("I'm just doing my job DualKim >:(");
		}
	}
}
