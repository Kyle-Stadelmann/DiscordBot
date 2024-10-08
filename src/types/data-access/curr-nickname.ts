import dynamoose from "dynamoose";
import { Item } from "dynamoose/dist/Item";

const oldNicknameSchema = new dynamoose.Schema({
	userId: {
		type: String,
		hashKey: true,
		required: true,
	},
	name: {
		type: String,
	},
});

export interface OldNickname extends Item {
	userId: string;
	name: string;
}

export const OldNicknameModel = dynamoose.model<OldNickname>("old-nickname", oldNicknameSchema);

export function getNicknames(ids: string[]): Promise<OldNickname[]> {
	return OldNicknameModel.batchGet(ids);
}
