import axios from "axios";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import { getAfkPicUrls } from "../types/data-access/afk-pic.js";
import { getAllStagingPics } from "../types/data-access/staging-afk-pic.js";
import { PROJECT_DIR } from "../constants.js";
import { initDb } from "../util/db-helper.js";

initDb();

const backupPath = path.join(PROJECT_DIR, "afk-pics");

async function downloadImage(url: string, dest: string) {
	const response = await axios({
		method: "get",
		url,
		responseType: "arraybuffer",
	});

	const buffer = Buffer.from(response.data);

	await fs.writeFile(dest, buffer);
}

// Used to get a consistent file hash for each url
// useful if we want to compare images between different backup points
function getFileUrlHash(url: string): string {
	const hash = crypto.createHash("sha256").update(url);
	return hash.digest("hex");
}

async function generateBackupDir(): Promise<string> {
	const d = new Date();
	const name = `${d.toDateString()} ${d.getHours()}-${d.getMinutes()}-${d.getSeconds()}`;
	const dirPath = path.join(backupPath, name);

	await fs.mkdir(dirPath, { recursive: true });

	return dirPath;
}

export async function backupAfkPics() {
	const afkPicUrls = await getAfkPicUrls();
	const stagingPicUrls = (await getAllStagingPics()).map((sp) => sp.url);

	const urls = afkPicUrls.concat(stagingPicUrls);

	const backupFolderPath = await generateBackupDir();

	console.log("Backing up afk pics...");

	for (const url of urls) {
		const fileName = getFileUrlHash(url);
		const outputPath = path.join(backupFolderPath, `${fileName}.png`);

		console.log(`Downloading ${url} to ${outputPath}`);

		try {
			// eslint-disable-next-line no-await-in-loop
			await downloadImage(url, outputPath);
		} catch (e) {
			console.error(`Failed to download ${url}`);
			console.error(e);
		}
	}

	console.log(`Afk pics backed up to ${backupFolderPath}`);
}
