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
		schema: [String],
		required: true,
	},
	subscriberIds: {
		type: Array,
		schema: [String],
		required: true,
	},
	// No specified size = unlimited size
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
	size: number;
	expire: Date;
}
export const ActivityTypedModel = dynamoose.model<Activity>("activity", activitySchema);

export function getActivity(guildId: string, name: string): Promise<Activity | undefined> {
	return ActivityTypedModel.get({ guildId, name });
}

export function createActivity(guildId: string, name: string, participantIds: string[], size: number, expire: Date) {
	return ActivityTypedModel.create({ guildId, name, participantIds, subscriberIds: [], size, expire });
}

// Activities retain state (subscriberIds) even after expiration.
// This means when an activity expires, we cannot delete its db entry.
// Therefore, to end an activity, we simply set the expiration time to now.
export async function endActivity(activity: Activity) {
	// eslint-disable-next-line no-param-reassign
	activity.expire = new Date();
	await activity.save();
}
