import { EmbedBuilder } from "discord.js";
import { UserIdea } from "../types/data-access/idea.js";
import { IdeaType } from "../commands/utility/idea.js";

const MAX_IDEAS_PER_PAGE = 5;

function capitalizeFirstLetter(str: string): string {
	return `${str.charAt(0).toUpperCase()}${str.substring(1)}`;
}

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
					.setTitle(type === undefined ? "All Ideas" : `${capitalizeFirstLetter(type)} Ideas`)
					.setFooter({ text: `Page ${pageNum + 1} of ${maxPagesCount}` })
					.setColor(0x0)
			);
		}

		const embed = pages[pageNum];
		embed.addFields({
			name: `(${i + 1})`,
			value: `**Type**: ${capitalizeFirstLetter(idea.type)}\n **Idea**: ${idea.description}\n **Completed**: ${
				idea.completed
			}`,
		});
	}
	return pages;
}
