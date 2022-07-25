import CryptoJs from "crypto-js";
import FastGlob from "fast-glob";
import path from "path";
import fs from "fs/promises";
import { Message, TextChannel } from "discord.js";
import { AFKPIC_FG_LOC, DEV_SERVER_TESTING_CHANNEL_1_ID } from "../constants.js";
import { AfkPicCodeMap } from "../types/containers/afk_pic_container.js";
import { AfkPic, AfkPicTypedModel, doesAfkPicExist } from "../types/data_access/afk_pic.js";
import { initDb } from "../util/db_helper.js";
import { client } from "../app.js";
import { sleep } from "../util/sleep.js";

initDb();

async function hashFile(filePath: string): Promise<string> {
    const fileData = await fs.readFile(filePath, {"encoding": "hex"});
    return CryptoJs.SHA256(fileData).toString();
}

// Returns map: pic path -> url
async function uploadPics(picPaths: string[]): Promise<Map<string, string>> {
    const devChannel = client.channels.resolve(DEV_SERVER_TESTING_CHANNEL_1_ID) as TextChannel;
    const picPathUrlMap = new Map<string, string>();

    for (const picPath of picPaths) {
        console.log(`Uploading afk pic: ${picPath}`);
        let msg: Message;
        try {
            // eslint-disable-next-line no-await-in-loop
            msg = await devChannel.send({"files": [picPath]});

            // Waiting extra time between uploading images, do not want to get smited by the discord gods
            // eslint-disable-next-line no-await-in-loop
            await sleep(5000);

            const attachments = [...msg.attachments.values()]
            picPathUrlMap.set(picPath, attachments[0].url);
        } catch(error) {
            console.error(error);
        }
    }

    return picPathUrlMap;
}

async function parseFiles() {
    console.log("Loading local AFK pics...")

    // file hash -> file path
    const fileHashMap = new Map<string, string>();

    const allPicFiles = await FastGlob(`${AFKPIC_FG_LOC}/*.{jpg,png,JPG,PNG}`, {absolute: true});

    // This might take a lotta memory at once. Might need to limit to batches of 10 or something
    const hashPromises = allPicFiles.map(async (filePath) => {
        const hash = await hashFile(filePath);
        
        if (!doesAfkPicExist(hash)) {
            fileHashMap.set(hash, filePath);
        }
    });

    await Promise.all(hashPromises);

    const picPathUrlMap = await uploadPics(Array.from(fileHashMap.keys()));

    const createPromises: Promise<AfkPic>[] = [];
    for (const [fileHash, filePath] of fileHashMap) {
        const picFileName = path.basename(filePath);
        const url = picPathUrlMap.get(filePath);

        for (const [code, userId] of AfkPicCodeMap) {
            if (picFileName.includes(code)) {
                createPromises.push(AfkPicTypedModel.create({"id": fileHash, "userId": userId, "url": url}));
            }
        }
    }

    await Promise.all(createPromises);

    console.log(`Loaded ${allPicFiles.length} total pics ${fileHashMap.size} of which were added to the afk pic table.`);
}

parseFiles().catch(console.error)