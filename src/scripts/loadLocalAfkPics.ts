import FastGlob from "fast-glob";
import path from "path";
import { Message, TextChannel } from "discord.js";
import { sanitizeUrl } from "@braintree/sanitize-url";
import { AFKPIC_FG_LOC, DEV_SERVER_TESTING_CHANNEL_1_ID } from "../constants.js";
import { AfkPicCodeMap } from "../types/containers/afk-pic-container.js";
import { UserAfkPic, UserAfkPicTypedModel, doesAfkPicExist } from "../types/data-access/afk-pic.js";
import { client } from "../app.js";
import { printSpace, sleep } from "../util/index.js";

// Returns map: pic path -> url
async function uploadPics(picPaths: string[]): Promise<Map<string, string>> {
	const devChannel = client.channels.resolve(DEV_SERVER_TESTING_CHANNEL_1_ID) as TextChannel;
	const picPathUrlMap = new Map<string, string>();

	for (const picPath of picPaths) {
		console.log(`Uploading afk pic: ${picPath}`);
		let msg: Message;
		try {
			// eslint-disable-next-line no-await-in-loop
			msg = await devChannel.send({ files: [picPath] });

			// Waiting extra time between uploading images, do not want to get smited by the discord gods
			// eslint-disable-next-line no-await-in-loop
			await sleep(5000);

			const url = sanitizeUrl(msg.attachments.first().url);
			picPathUrlMap.set(picPath, url);
		} catch (error) {
			console.error(error);
		}
	}

	return picPathUrlMap;
}

function doesPicHaveValidUsers(fileName: string): boolean {
	return AfkPicCodeMap.some((userId, code) => fileName.includes(code));
}

export async function parseFiles() {
	console.log("Loading local AFK pics...");

	const allPicFiles = await FastGlob(`${AFKPIC_FG_LOC}/*.{jpg,png,JPG,PNG}`, { absolute: true });

	if (allPicFiles.length === 0) {
		console.log(`Loaded 0 total pics.`);
		printSpace();
		return;
	}

	const validatePicPromises = allPicFiles.flatMap(async (filePath) => {
		const picFileName = path.basename(filePath);

		return (await doesAfkPicExist(picFileName)) || !doesPicHaveValidUsers(picFileName) ? [] : [filePath];
	});
	// Absolute file paths for validated pictures to add to db
	const filePathsToAdd = (await Promise.all(validatePicPromises)).flat();

	const picPathUrlMap = await uploadPics(filePathsToAdd);

	const createPromises: Promise<UserAfkPic>[] = [];
	for (const [picPath, url] of picPathUrlMap) {
		const picFileName = path.basename(picPath);

		for (const [code, userId] of AfkPicCodeMap) {
			if (picFileName.includes(code)) {
				createPromises.push(UserAfkPicTypedModel.create({ filename: picFileName, url, userId }));
			}
		}
	}

	await Promise.all(createPromises);

	console.log(
		`Loaded ${allPicFiles.length} total pics, ${picPathUrlMap.size} of which were added to the afk pic table.`
	);
	printSpace();
}
