import { EmbedBuilder } from "discord.js";
import { UserIdea } from "../types/data-access/idea.js";
import { IdeaType } from "../commands/utility/idea.js";

const MAX_IDEAS_PER_PAGE = 5;

// When type is undefined, we are displaying all ideas
export function buildIdeaEmbeds(ideas: UserIdea[], type: IdeaType | undefined): EmbedBuilder[] {
	const pages: EmbedBuilder[] = [];
	const maxPagesCount = Math.ceil(ideas.length / MAX_IDEAS_PER_PAGE);

	for (let i = 0; i < ideas.length; i += 1) {
		const idea = ideas[i];
		const pageNum = Math.floor(i / MAX_IDEAS_PER_PAGE);

		if (i % MAX_IDEAS_PER_PAGE === 0) {
			pages.push(
				new EmbedBuilder()
					.setTitle(type === undefined ? "All Ideas" : `${type} Ideas`)
					.setFooter({ text: `Page ${pageNum + 1} of ${maxPagesCount}` })
			);
		}

		const embed = pages[pageNum];
		embed.addFields({
			name: `(${i + 1})`,
			value: `**Type**: ${idea.type}\n **Idea**: ${idea.description}\n **Completed**: ${idea.completed}`,
		});
	}
	return pages;
}
