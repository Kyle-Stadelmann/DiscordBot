import fs from "fs";
import { COOLDOWN_JSON_LOC } from "../constants.js";

const fsPromises = fs.promises;

// If file exists, do nothing. Otherwise create empty json file "{}"
export async function touchJSONCooldownFile() {
	const file = await fsPromises.open(COOLDOWN_JSON_LOC, "a");
	if ((await file.stat()).size === 0) {
		await file.appendFile("{}");
	}
	await file.close();
}

export interface CooldownFile  {
	[name: string]: Cooldown;
}

export interface Cooldown {
	[id: string]: Date;
}