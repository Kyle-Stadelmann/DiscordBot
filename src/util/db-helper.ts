import dynamoose from "dynamoose";
import * as dotenv from "dotenv";
import { SRC_DIR } from "../constants.js";

export function initDb() {
	dotenv.config({ path: `${SRC_DIR}/../.env` });

	const ddb = new dynamoose.aws.ddb.DynamoDB({
		credentials: {
			accessKeyId: process.env.DYNAMO_ACCESS_KEY_ID,
			secretAccessKey: process.env.DYNAMO_SECRET_ACCESS_KEY,
		},
		region: "us-west-1",
	});
	dynamoose.aws.ddb.set(ddb);
}
