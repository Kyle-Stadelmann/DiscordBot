import { EmbedBuilder } from "discord.js";
import { IDEA_TYPES } from "../constants.js";
import { getAllIdeas, UserIdea } from "../types/data-access/idea.js";
import { IdeaType } from "../commands/utility/idea.js";

// All ideas is x === 0 cuz utility = 0 was causing conditional issues
export async function refreshIdeas(): Promise<EmbedBuilder[][]> {
	const ideas = await getAllIdeas();
	let ideaEmbeds: EmbedBuilder[] = [];
	const sortedIdeaPages: EmbedBuilder[][] = [];

	for (let x = 0; x < IDEA_TYPES.length + 1; x += 1) {
		let pageNum = 0;
		const shownIdeas = ideas.filter(idea => )
		for (let y = 0; y < ideas.length; y += 1) {
			if (x === 0 || ideas[y].type === IDEA_TYPES[x - 1]) shownIdeas.push(ideas[y]);
		}

		// TODO: add ID or something to embed to identify for completion marking
		for (let z = 0; z < shownIdeas.length; z += 1) {
			if (z % 5 === 0) {
				if (z !== 0) pageNum += 1;
				ideaEmbeds[pageNum] = new EmbedBuilder().setTitle(
					`${IDEA_TYPES[x - 1] ? `${IDEA_TYPES[x - 1]} Ideas` : "All Ideas"} | Page ${pageNum + 1}`
				);
			}
			ideaEmbeds[pageNum].addFields({
				name: `(${z + 1})`,
				value: `Type: ${shownIdeas[z].type}\n Idea: ${shownIdeas[z].description}`,
			});
		}

		sortedIdeaPages.push(ideaEmbeds);
		ideaEmbeds = [];
	}

	return sortedIdeaPages;
}

export async function buildIdeaPages(ideaType: IdeaType): Promise<EmbedBuilder[]> {
	const allIdeas = await getAllIdeas();

	const filteredIdeas = allIdeas.filter(idea => ideaType === IdeaType.all || idea.type === ideaType);

	
}