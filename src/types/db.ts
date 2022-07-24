import * as dynamoose from "dynamoose";
import { Credentials } from "dynamoose/dist/aws/sdk.js";
import { Document } from "dynamoose/dist/Document.js";

dynamoose.aws.sdk.config.update({
    "credentials": new Credentials({"accessKeyId": process.env.DYNAMO_ACCESS_KEY_ID, "secretAccessKey": process.env.DYNAMO_SECRET_ACCESS_KEY}),
    "region": "us-west-1"
})
export class Db {
    
}