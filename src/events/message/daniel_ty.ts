import { Message } from "discord.js";
import { Discord, On } from "discordx";
import { DANIEL_ID } from "../../constants";
import { sendMessage } from "../../util";

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class DanielTy {
	@On("message")
	private async handleDanielTy(msg: Message) {
		const { channel } = msg;
		const content = msg.content.toLowerCase();
		// Only continue if Daniel sent the message
		if (msg.author.id !== DANIEL_ID) return;

		// Reads variations of "thank you bot" from daniel in chat and replys with "you're welcome dualkim"
		if (content.includes("thank") && content.includes("bot")) {
			await sendMessage(channel, "You're welcome DualKim! :)");
		}

		// Reads daniels complaint from chat, replys to  dualkim, telling him i'm just doing my job
		if (content.includes("fuck") && content.includes("bot")) {
			await sendMessage(channel, "I'm just doing my job DualKim >:(");
		}
	}
}
