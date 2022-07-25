import * as dynamoose from "dynamoose";
import { Document } from "dynamoose/dist/Document";

const afkPicSchema = new dynamoose.Schema({
    "id": {
        "type": String,
        "index": true
    },
    "url": String,
    "userId": {
        "type": String,
        "index": {global: true}
    }
});

export interface AfkPic extends Document {
    id: string;
    url: string;
    userId: string;
}
export const AfkPicTypedModel = dynamoose.model<AfkPic>("user-afk-pic", afkPicSchema);

export async function doesAfkPicExist(picHash: string): Promise<boolean> {
    try {
        const pic = await AfkPicTypedModel.get(picHash);
        return !!pic;
    } catch (error) {
        console.error(error);
        // Shouldn't be an error
        return false;
    }
}

export async function getAllPicsForUser(userId: string): Promise<AfkPic[]> {
    try {
        const response = await AfkPicTypedModel
            .query("userId")
            .eq(userId)
            .exec();
        return response;
    } catch (error) {
        console.error(error);
        return [];
    }
}