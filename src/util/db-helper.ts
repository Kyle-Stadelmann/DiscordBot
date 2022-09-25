import dynamoose from "dynamoose";
import * as dotenv from "dotenv";
import { SRC_DIR } from "../constants.js";

const aws = dynamoose.aws.sdk;
const { Credentials } = aws;

export function initDb() {
	// Import .env file variables (for BOT_TOKEN)
	dotenv.config({ path: `${SRC_DIR}/../.env` });

	// Init db
	aws.config.update({
		credentials: new Credentials({
			accessKeyId: process.env.DYNAMO_ACCESS_KEY_ID,
			secretAccessKey: process.env.DYNAMO_SECRET_ACCESS_KEY,
		}),
		region: "us-west-1",
	});
}
