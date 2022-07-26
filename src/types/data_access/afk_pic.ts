import * as dynamoose from "dynamoose";
import { Document } from "dynamoose/dist/Document";

const afkPicSchema = new dynamoose.Schema({
    "filename": {
        "type": String,
        "index": {
            "rangeKey": "userId"
        }
    },
    "url": String,
    "userId": {
        "type": String,
        "index": {global: true}
    },
    "submitterUserId": {
        "type": String,
        "required": false
    }
}, {
    "timestamps": true
});

// Note: some afk pics have multiple users in them.
// These pictures have one record *per user*
// This makes the model less intuitive, but allows for querying on user Id
export interface UserAfkPic extends Document {
    filename: string;
    url: string;
    userId: string;
    submitterUserId?: string;
}
export const UserAfkPicTypedModel = dynamoose.model<UserAfkPic>("user-afk-pic", afkPicSchema);

// Can throw dynamo errors 
// TODO: should we catch them or let it blow up?
export async function doesAfkPicExist(filename: string): Promise<boolean> {
    const response = await UserAfkPicTypedModel
        .query(filename)
        .exec();
    return response.count > 0;
}

export async function getAllPicsForUser(userId: string): Promise<UserAfkPic[]> {
    try {
        const response = await UserAfkPicTypedModel
            .query("userId")
            .eq(userId)
            .exec();
        return response;
    } catch (error) {
        console.error(error);
        return [];
    }
}
