import dynamoose from "dynamoose";
import { Item } from "dynamoose/dist/Item";

const stagingAfkPicSchema = new dynamoose.Schema(
	{
		url: {
			type: String,
			hashKey: true,
			required: true,
		},
		submitterUserId: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

export interface StagingAfkPic extends Item {
	url: string;
	submitterUserId: string;
}
export const StagingAfkPicTypedModel = dynamoose.model<StagingAfkPic>("staging-afk-pic", stagingAfkPicSchema);

export function getAllStagingPics(): Promise<StagingAfkPic[]> {
	return StagingAfkPicTypedModel.scan().all().exec();
}
