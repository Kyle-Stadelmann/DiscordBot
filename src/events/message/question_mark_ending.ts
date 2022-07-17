import { Message, MessageEmbed } from "discord.js";
import { Discord, On } from "discordx";
import { QUESTION_MARK_URL } from "../../constants";
import { random, sendEmbeds } from "../../util";

const QUESTION_MARK_CHANCE = 5;

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class QuestionMarkEnding {
	@On("message")
	private async handleQuestionMarkEnding(msg: Message) {
		if (msg.content.charAt(msg.content.length - 1) !== "?") return;

		if (random(QUESTION_MARK_CHANCE)) {
			const embed = new MessageEmbed().setImage(QUESTION_MARK_URL);
	
			await sendEmbeds(msg.channel, [embed]);
		}
	}
}
