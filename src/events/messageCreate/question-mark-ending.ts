import { EmbedBuilder } from "discord.js";
import { ArgsOf, Discord, On } from "discordx";
import { QUESTION_MARK_URL } from "../../constants.js";
import { random } from "../../util/index.js";

const QUESTION_MARK_CHANCE = 5;

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
abstract class QuestionMarkEnding {
	@On({ event: "messageCreate" })
	private async handleQuestionMarkEnding([msg]: ArgsOf<"messageCreate">) {
		if (msg.content.charAt(msg.content.length - 1) !== "?") return;

		if (random(QUESTION_MARK_CHANCE)) {
			const embed = new EmbedBuilder().setImage(QUESTION_MARK_URL);

			await msg.channel.send({ embeds: [embed] });
		}
	}
}
