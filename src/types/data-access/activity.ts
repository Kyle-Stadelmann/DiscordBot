import dynamoose from "dynamoose";
import { Item } from "dynamoose/dist/Item";

const activitySchema = new dynamoose.Schema({
	guildId: {
		type: String,
		required: true,
		hashKey: true,
	},
	name: {
		type: String,
		required: true,
		rangeKey: true,
	},
	participantIds: {
		type: Array,
		required: true,
	},
	subscriberIds: {
		type: Array,
		required: true,
	},
	size: {
		type: Number,
	},
	expire: {
		type: Date,
		required: true,
	},
});

export interface Activity extends Item {
	guildId: string;
	name: string;
	participantIds: string[];
	subscriberIds: string[];
	expire: Date;
}
export const ActivityTypedModel = dynamoose.model<Activity>("activity", activitySchema);

export function getActivity(guildId: string, name: string): Promise<Activity | undefined> {
	return ActivityTypedModel.get({ guildId, name });
}
