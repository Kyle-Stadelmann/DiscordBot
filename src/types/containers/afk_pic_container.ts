import { Collection, Message, TextChannel } from "discord.js";
import FastGlob from "fast-glob";
import path from "path";
import { Low, JSONFile } from "lowdb";
import { client } from "../../app.js";
import { AFKPIC_JSON_LOC, ALAN_ID, ANISH_ID, ASIAN_KYLE_ID, DANIEL_ID, DEV_SERVER_TESTING_CHANNEL_1_ID, ERIC_ID, GARY_ID, JASON_ID, JOHNNY_ID, JUSTIN_M_ID, KEISI_ID, KHANG_ID, MEGU_ID, NATHAN_P_ID, NAT_ID, SWISS_KYLE_ID, TWEED_ID, ZACH_ID } from "../../constants.js";
import { AfkPic, AfkPicFile } from "../afk_pic.js";
import { sleep } from '../../util/sleep.js';
import { getRandomElement } from "../../util/random.js";

// User id to afk pic code
const afkPicCodeMap = new Collection<string, string>();
afkPicCodeMap.set("AD", ALAN_ID);
afkPicCodeMap.set("AS", ANISH_ID);
afkPicCodeMap.set("DK", DANIEL_ID);
afkPicCodeMap.set("EW", ERIC_ID);
afkPicCodeMap.set("JAD", JASON_ID);
afkPicCodeMap.set("GC", GARY_ID);
afkPicCodeMap.set("JC", JOHNNY_ID);
afkPicCodeMap.set("JM", JUSTIN_M_ID);
afkPicCodeMap.set("KN", KHANG_ID);
afkPicCodeMap.set("KS", ASIAN_KYLE_ID);
afkPicCodeMap.set("ME", SWISS_KYLE_ID);
afkPicCodeMap.set("KT", KEISI_ID);
afkPicCodeMap.set("MGU", MEGU_ID);
afkPicCodeMap.set("MM", TWEED_ID);
afkPicCodeMap.set("NN", NAT_ID);
afkPicCodeMap.set("NP", NATHAN_P_ID);
afkPicCodeMap.set("ZT", ZACH_ID);

export class AfkPicContainer {
    // File path -> afk pic 
    // This is parsed from the local files
    private filePicsMap = new Collection<string, AfkPic>();
    // User id -> afk pic 
    // This is filled after parsing/db initalizing 
    private userPicsMap = new Collection<string, AfkPic[]>();

    private db: Low<AfkPicFile>;

    constructor() {
        const adapter = new JSONFile<AfkPicFile>(AFKPIC_JSON_LOC);
		this.db = new Low(adapter);
    }

    public async initContainer() {
        await Promise.all([this.db.read(), this.parseFiles()]);

        // Combines db and local afk pics (url field specifically)
        await this.aggregateAfkPics();

        // For pics that still don't have url, upload pic to discord servers and get that url
        await this.enrichPicUrl();

        this.db.data = [...this.filePicsMap.values()];
        
        await this.db.write();

        this.fillUserPicsMap();
    }

    public hasUser(userId: string): boolean {
        return this.userPicsMap.has(userId);
    }

    public getPic(userId?: string): AfkPic {
        return (userId) 
            ? getRandomElement(this.userPicsMap.get(userId))
            : this.filePicsMap.random();
    }

    private async enrichPicUrl() {
        const filePicsMapWithoutUrl = this.filePicsMap.filter((pic) => !pic.url);
        const devChannel = client.channels.resolve(DEV_SERVER_TESTING_CHANNEL_1_ID) as TextChannel;

        for (const [picPath, pic] of filePicsMapWithoutUrl) {
            console.log(`Uploading afk pic: ${picPath}`);
            let msg: Message;
            try {
                // eslint-disable-next-line no-await-in-loop
                msg = await devChannel.send({"files": [picPath]});

                // Waiting extra time between uploading images, do not want to get smited by the discord gods
                // eslint-disable-next-line no-await-in-loop
                await sleep(5000);

                const attachments = [...msg.attachments.values()]
                pic.url = attachments[0].url;

                this.db.data = [...this.filePicsMap.values()];
                // eslint-disable-next-line no-await-in-loop
                await this.db.write();
            }catch(error) {
                console.error(error);
                // Failed to upload afk pic, delete from map
                this.filePicsMap.delete(picPath);
            }
        }
    }

    private async aggregateAfkPics() {
        const dbPics = this.db.data;

        for (const dbPic of dbPics) {
            const picPath = dbPic.filePath;

            if (this.filePicsMap.has(picPath)) {
                const localPic = this.filePicsMap.get(picPath);
                localPic.url = dbPic.url;
            }
        }
    }

    private fillUserPicsMap() {
        for (const [picPath, pic] of this.filePicsMap) {
            for (const [code, userId] of afkPicCodeMap) {
                const picFileName = path.basename(picPath);

                if (picFileName.includes(code)) {
                    const currPics = this.userPicsMap.get(userId) ?? [];
                    currPics.push(pic);
                    this.userPicsMap.set(userId, currPics);
                }
            }
        }
    }

    private async parseFiles() {
        console.log("Loading AFK pics...")
        const allPicFiles = await FastGlob(`pics/AFK_PICS/*.{jpg,png,JPG,PNG}`, {absolute: true});

        for (const picFile of allPicFiles) {
            const picFileName = path.basename(picFile);
            const afkPic = new AfkPic(new Set(), null, picFile);

            for (const [code, userId] of afkPicCodeMap) {
                if (picFileName.includes(code)) {
                    afkPic.users.add(userId);
                }
            }

            // Only collect afk pic if it had a relevant user
            if (afkPic.users.size > 0) {
                this.filePicsMap.set(picFile, afkPic);
            }
        }

        console.log(`Loaded ${allPicFiles.length} total pics ${this.filePicsMap.size} of which were relevant.`);
    }
}