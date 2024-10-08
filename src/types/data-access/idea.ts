import dynamoose from "dynamoose";
import { Item } from "dynamoose/dist/Item";

const ideaSchema = new dynamoose.Schema(
	{
		id: {
			type: String,
			required: true,
			hashKey: true,
		},
		userId: {
			type: String,
			required: true,
			index: { type: "global", rangeKey: "type" },
		},
		type: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		completed: {
			type: Boolean,
			required: true,
		},
	},
	{
		timestamps: true,
	}
);
export const userIdIndex = "userIdGlobalIndex";

export interface UserIdea extends Item {
	id: string;
	userId: string;
	type: string;
	description: string;
	completed: boolean;
	createdAt: number;
	updatedAt: number;
}
export const UserIdeaTypedModel = dynamoose.model<UserIdea>("idea", ideaSchema);

export async function getAllIdeas(): Promise<UserIdea[]> {
	return UserIdeaTypedModel.scan().all().exec();
}

export async function getIdeasByType(type: string): Promise<UserIdea[]> {
	// TODO: change type to be a hash key and use query here
	return UserIdeaTypedModel.scan("type").eq(type).all().exec();
}

export async function createIdea(id: string, userId: string, type: string, description: string): Promise<UserIdea> {
	return UserIdeaTypedModel.create({
		id,
		userId,
		type,
		description,
		completed: false,
	});
}
