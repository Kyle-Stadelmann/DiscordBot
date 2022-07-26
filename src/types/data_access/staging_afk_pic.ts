import * as dynamoose from "dynamoose";
import { Document } from "dynamoose/dist/Document";

const stagingAfkPicSchema = new dynamoose.Schema({
    "url": {
        "type": String,
        "index": true,
        "required": true
    },
    "submitterUserId": {
        "type": String,
        "required": true
    }
}, {
    "timestamps": true
});

export interface StagingAfkPic extends Document {
    url: string;
    submitterUserId: string;
}
export const StagingAfkPicTypedModel = dynamoose.model<StagingAfkPic>("staging-afk-pic", stagingAfkPicSchema);

export function getAllStagingPics(): Promise<StagingAfkPic[]> {
    return StagingAfkPicTypedModel
        .scan()
        .exec();
}