import * as fs from 'fs';

const fsPromises = fs.promises;

// If file exists, do nothing. Otherwise create empty json file "{}"
export async function touchJSONFile(filepath: string, defaultValue: string = "{}") {
	const file = await fsPromises.open(filepath, "a");
	if ((await file.stat()).size === 0) {
		await file.appendFile(defaultValue);
	}
	await file.close();
}