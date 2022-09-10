import * as dynamoose from "dynamoose";
import { Document } from "dynamoose/dist/Document";

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
			index: { global: true, rangeKey: "type" },
		},
		type: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: true,
	}
);
export const userIdIndex = "userIdGlobalIndex";

export interface UserIdea extends Document {
	id: string;
	userId: string;
	type: string;
	description: string;
}
export const UserIdeaTypedModel = dynamoose.model<UserIdea>("idea", ideaSchema);
